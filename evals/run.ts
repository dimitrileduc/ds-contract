/**
 * Deterministic eval suite — `npm run eval`.
 *
 * Turns the PoC's claims into falsifiable checks. Each case runs the REAL
 * pipeline (generator / token build / parity differ) in a scratch copy of the
 * repo (evals/.scratch, node_modules symlinked), applies one mutation, and
 * asserts the exact expected behavior:
 *
 *   C1 Determinism   — regeneration is byte-identical
 *   C2 Refusal       — invalid states fail the build (never silently pass)
 *   C3 Detection     — every drift class is caught, correctly classified,
 *                      with a usable promotion patch where applicable
 *   C4 Convergence   — applying a proposed patch + regenerating returns the
 *                      system to parity (with only the expected next-step
 *                      finding remaining)
 *
 * The live-Figma round-trip evals (export→import zero-diff) can't run
 * headless; their executed results are recorded in docs/07-validation.md.
 */

import { readFileSync, writeFileSync, cpSync, rmSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  ROOT, SCRATCH, TSX, resetScratch, run, generate, buildTokens, parity, readReport,
  parseSyncComponent, replaceInFile, editJson, hashTree, expectFinding,
  BTN_TSX, CONTRACT, VARIANT_DECL, FIGMA_SET, VARIANT_PROPERTY,
  FIGMA_COMPONENTS, FIGMA_TOKENS, MINIMAL_CONTRACT,
  customPropDefs, parseModuleCss, resolveToRef, type TokenLookup,
  ContractSchema, schemaResolveTokens, type SchemaContract, type SchemaPart,
  proposePrBuildPlan, contentsPutBody, proposePrSummarize,
  coreEmitReact, coreIsMultiRoot, coreValidateContract, createFigmaEngine, coreEmitHtml, coreEmitReactInline,
  iconComponentsFromRegistry, type IconRegistryEntry,
  tokenInventoryFromJson, loadCaptureConfig, propSpaceFor,
  depthBuildUnion, buildMultiRootUnion, descendToRealRoots, depthNameUnion,
  depthPromoteAnatomy, promoteMultiRootAnatomy, type DepthCapture, type DepthNode, depthKebab,
  type Case, type RunResult,
} from './harness.js';
import { legacyCases } from './legacy-cases.js';
import { normalizeVectorSvg } from '../extract/figma/vector-assets.js';

/**
 * 019 — les schémas des cinq formats d'intégration vivent sous `specs/`, que
 * `resetScratch()` ne copie PAS (sa liste de répertoires n'a pas d'entrée
 * `specs`, et le cas `odoo-tokens-output` de 018 s'appuie explicitement sur ce
 * fait). Les portes de 019 lisent donc leurs schémas via `PQR_ODOO_SCHEMA_DIR`.
 * On le pose autour d'un cas et on le restaure, plutôt que globalement : une
 * variable d'environnement qui survit d'un cas à l'autre est un couplage
 * invisible entre cas.
 */
const ODOO_SCHEMA_DIR = path.join(ROOT, 'specs', '019-odoo-production-foundation', 'contracts');
function avecSchemasOdoo<T>(fn: () => T): T {
  const avant = process.env.PQR_ODOO_SCHEMA_DIR;
  process.env.PQR_ODOO_SCHEMA_DIR = ODOO_SCHEMA_DIR;
  try {
    return fn();
  } finally {
    if (avant === undefined) delete process.env.PQR_ODOO_SCHEMA_DIR;
    else process.env.PQR_ODOO_SCHEMA_DIR = avant;
  }
}

const cases: Case[] = [
  {
    // 025 — la projection Figma doit rester une dérivation de contrats, jamais
    // une seconde liste d'URLs saisies dans les panneaux Odoo. Ce cas couvre les
    // racines/shell, les six enfants et les refus de gouvernance nommés.
    id: 'odoo-figma-links-governance',
    claim: 'C2-refusal',
    run: () => {
      const build = (...args: string[]) => run(TSX, ['scripts/odoo/build-figma-links.ts', ...args]);
      const manifest = path.join(SCRATCH, 'integrations/odoo/config/figma-panels.json');
      const generated = path.join(SCRATCH, 'integrations/odoo/addons/piqueray_ds/static/src/js/generated/figma_links.js');
      const authoring = path.join(SCRATCH, 'integrations/odoo/addons/piqueray_ds/static/src/js/authoring.js');
      const xml = path.join(SCRATCH, 'integrations/odoo/addons/piqueray_ds/static/src/xml/authoring.xml');
      const packageJson = path.join(SCRATCH, 'package.json');
      // Le harnais n'embarque pas le sous-répertoire QA par défaut ; le census
      // est une fixture relue, donc il doit rejoindre explicitement le scratch
      // de ce cas avant d'exercer le générateur réel.
      const census = path.join(SCRATCH, 'integrations/odoo/qa/fixtures/figma-panels.expected.json');
      mkdirSync(path.dirname(census), { recursive: true });
      cpSync(path.join(ROOT, 'integrations/odoo/qa/fixtures/figma-panels.expected.json'), census);
      const refusalCases = JSON.parse(readFileSync(path.join(ROOT, 'evals/fixtures/odoo-figma-links/cases.json'), 'utf8'));
      if (JSON.stringify(refusalCases.requiredCases) !== JSON.stringify([
        'missing-panel', 'duplicate-panel', 'missing-contract', 'version-mismatch', 'missing-anchor',
        'invalid-file-key', 'invalid-node-id', 'ambiguous-panel', 'generic-fallback', 'third-party-selector',
      ])) throw new Error('fixture de refus Figma incomplète ou non déterministe');

      const first = build();
      if (first.status !== 0) throw new Error(`projection Figma initiale rouge:\n${first.out}`);
      const output = readFileSync(generated, 'utf8');
      if (!output.includes('DO NOT EDIT') || /https:\/\/www\.figma\.com/.test(output)) {
        throw new Error('la projection doit être générée, marquée DO NOT EDIT et ne doit pas recopier une URL Figma');
      }
      for (const panelId of [
        'presentation', 'google-reviews', 'hero', 'equipe', 'devis', 'faq', 'sav', 'texte-seo',
        'coordonnees', 'reassurances', 'categories-principales', 'footer',
        'review-card', 'member-card', 'faq-row', 'texte-seo-row', 'reassurances-card', 'category-card',
      ]) {
        if (!output.includes(`panelId: ${JSON.stringify(panelId)}`)) throw new Error(`panneau Figma absent : ${panelId}`);
      }
      if (build().status !== 0 || readFileSync(generated, 'utf8') !== output || build('--check').status !== 0) {
        throw new Error('la projection Figma n\'est pas byte-stable ou --check est rouge');
      }

      const sourceAuthoring = readFileSync(authoring, 'utf8');
      const sourceXml = readFileSync(xml, 'utf8');
      const scripts = JSON.parse(readFileSync(packageJson, 'utf8')).scripts;
      for (const needle of [
        'class OpenFigmaAction extends BuilderAction',
        'window.open(url.toString(), "_blank", "noopener,noreferrer")',
        'class PiquerayFigmaLinkOption extends BaseOptionComponent',
      ]) if (!sourceAuthoring.includes(needle)) throw new Error(`action/option Figma absente : ${needle}`);
      for (const needle of ['Ouvrir dans Figma', 'Référence Figma indisponible']) {
        if (!sourceXml.includes(needle)) throw new Error(`état de panneau Figma absent : ${needle}`);
      }
      if (scripts['odoo:figma-links'] !== 'tsx scripts/odoo/build-figma-links.ts' ||
          scripts['odoo:figma-links:check'] !== 'tsx scripts/odoo/build-figma-links.ts --check') {
        throw new Error('scripts odoo:figma-links absents ou divergents');
      }

      const originalManifest = readFileSync(manifest, 'utf8');
      const restore = () => writeFileSync(manifest, originalManifest);
      const mutate = (fn: (value: any) => void) => { const value = JSON.parse(originalManifest); fn(value); writeFileSync(manifest, JSON.stringify(value, null, 2) + '\n'); };

      mutate((value) => { value.panels.pop(); });
      const missing = build();
      if (missing.status === 0 || !missing.out.includes('census missing mapping')) throw new Error(`panneau oublié non refusé par census :\n${missing.out}`);

      mutate((value) => { value.panels.push({ ...value.panels[0] }); });
      const duplicate = build();
      if (duplicate.status === 0 || !duplicate.out.includes('duplicate panelId')) throw new Error(`panneau dupliqué non refusé :\n${duplicate.out}`);

      mutate((value) => { value.panels[0].selector = '.o_native_option'; });
      const thirdParty = build();
      if (thirdParty.status === 0 || !thirdParty.out.includes('native/third-party selector')) throw new Error(`sélecteur tiers non refusé :\n${thirdParty.out}`);

      mutate((value) => { value.panels[0].componentPath[0].contract.id = 'ds.introuvable'; });
      const missingContract = build();
      if (missingContract.status !== 0 || !readFileSync(generated, 'utf8').includes('reason: "missing-contract"') || build('--check').status === 0) {
        throw new Error('contrat absent doit produire unavailable et rendre --check rouge');
      }

      mutate((value) => { value.panels.find((panel: any) => panel.panelId === 'faq-row').componentPath[1].viaPart = 'Inconnue'; });
      const ambiguous = build();
      if (ambiguous.status !== 0 || !readFileSync(generated, 'utf8').includes('reason: "ambiguous-panel"') || build('--check').status === 0) {
        throw new Error('chemin ambigu/inatteignable doit produire unavailable et rendre --check rouge');
      }

      mutate((value) => { value.panels[0].componentPath[0].contract.version = '9.9.9'; });
      const version = build();
      if (version.status !== 0 || !readFileSync(generated, 'utf8').includes('reason: "version-mismatch"') || build('--check').status === 0) {
        throw new Error('version divergente doit produire unavailable et rendre --check rouge');
      }
      restore();

      const contract = path.join(SCRATCH, 'contracts/presentation.contract.json');
      const originalContract = readFileSync(contract, 'utf8');
      const contractValue = JSON.parse(originalContract);
      contractValue.anchors.figma.nodeId = '9999:9999';
      writeFileSync(contract, JSON.stringify(contractValue, null, 2) + '\n');
      if (build().status !== 0 || !readFileSync(generated, 'utf8').includes('nodeId: "9999:9999"')) {
        throw new Error('une ancre canonique mutée ne se propage pas dans la projection');
      }
      contractValue.anchors.figma.fileKey = null;
      delete contractValue.anchors.figma.nodeId;
      writeFileSync(contract, JSON.stringify(contractValue, null, 2) + '\n');
      if (build().status !== 0 || !readFileSync(generated, 'utf8').includes('reason: "missing-anchor"') || build('--check').status === 0) {
        throw new Error('ancre absente doit produire unavailable et rendre --check rouge');
      }
      const invalidFile = JSON.parse(originalContract);
      invalidFile.anchors.figma.fileKey = 'not/a/file-key';
      writeFileSync(contract, JSON.stringify(invalidFile, null, 2) + '\n');
      if (build().status !== 0 || !readFileSync(generated, 'utf8').includes('reason: "invalid-file-key"') || build('--check').status === 0) {
        throw new Error('fileKey invalide doit produire unavailable et rendre --check rouge');
      }
      const invalidNode = JSON.parse(originalContract);
      invalidNode.anchors.figma.nodeId = 'node-générique';
      writeFileSync(contract, JSON.stringify(invalidNode, null, 2) + '\n');
      if (build().status !== 0 || !readFileSync(generated, 'utf8').includes('reason: "invalid-node-id"') || build('--check').status === 0) {
        throw new Error('nodeId invalide doit produire unavailable et rendre --check rouge');
      }
      writeFileSync(contract, originalContract);
      if (build().status !== 0 || build('--check').status !== 0) throw new Error('la restauration canonique ne rend pas la projection verte');
    },
  },
  {
    // 019 — les sorties générées de l'addon Odoo. La règle des claims place ce
    // cas AVANT toute phrase affirmant que le module est reproductible.
    //
    // Il refuse quatre choses par leur nom :
    //   D1  deux générations ne rendent pas les mêmes octets ;
    //   D2  une sortie retouchée à la main passe `--check` ;
    //   D3  une valeur déplacée en amont ne se propage PAS (recopie unique
    //       déguisée en dérivation — le contrôle adversarial du lot) ;
    //   D4  le chrome de showcase de `emit-html` fuit en production.
    id: 'odoo-production-generated-output',
    claim: 'C1-determinism',
    run: () => avecSchemasOdoo(() => {
      const GEN = 'integrations/odoo/addons/piqueray_ds/static/src/css/generated';
      const COMPONENTS = `${GEN}/components.pqr.css`;
      const TOKENS = `${GEN}/tokens.pqr.css`;
      const abs = (rel: string) => path.join(SCRATCH, rel);
      const assets = (...extra: string[]) => run(TSX, ['scripts/odoo/build-assets.ts', ...extra]);

      // Les jetons CSS sont une entrée du build d'assets : on part d'un état
      // construit, comme le fait `npm run build`.
      if (buildTokens().status !== 0) throw new Error('build-tokens a échoué sur un scratch propre');
      const r1 = assets();
      if (r1.status !== 0) throw new Error(`odoo:assets a échoué :\n${r1.out}`);
      if (!existsSync(abs(COMPONENTS))) throw new Error(`D1: ${COMPONENTS} n'a pas été écrit`);

      const premier = readFileSync(abs(COMPONENTS), 'utf8');
      const premierTokens = readFileSync(abs(TOKENS), 'utf8');

      // ---- D4 : aucun habillage de showcase dans la sortie de production.
      if (/showcase/.test(premier)) throw new Error('D4: le chrome de showcase de emit-html a fui dans components.pqr.css');
      // Et le préfixe est TOTAL : une déclaration ou une référence nue rendrait
      // la feuille silencieusement inerte sous Odoo.
      const refNue = [...premier.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]).find((n) => !n.startsWith('--pqr-'));
      if (refNue) throw new Error(`D4: référence non préfixée dans la sortie : var(${refNue})`);
      const declNue = [...premierTokens.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]).find((n) => !n.startsWith('--pqr-'));
      if (declNue) throw new Error(`D4: déclaration non préfixée dans la sortie : ${declNue}`);

      // ---- D1 : deux fois, octet pour octet.
      if (assets().status !== 0) throw new Error('D1: seconde génération en échec');
      if (readFileSync(abs(COMPONENTS), 'utf8') !== premier) throw new Error('D1: deux générations consécutives diffèrent');
      const check = assets('--check');
      if (check.status !== 0) throw new Error(`D1: --check rouge sur une sortie fraîche :\n${check.out}`);

      // ---- D2 : la retouche est refusée, et NOMMÉE `tampered`.
      const retouche = readFileSync(path.join(SCRATCH, 'evals/fixtures/odoo-production/generated-output/tamper.css'), 'utf8');
      writeFileSync(abs(COMPONENTS), premier + retouche);
      const apresRetouche = assets('--check');
      if (apresRetouche.status === 0) throw new Error('D2: --check a accepté une sortie générée retouchée à la main');
      if (!apresRetouche.out.includes('tampered')) throw new Error(`D2: le refus ne nomme pas \`tampered\` :\n${apresRetouche.out}`);
      if (assets().status !== 0) throw new Error('D2: la régénération après retouche a échoué');
      if (readFileSync(abs(COMPONENTS), 'utf8') !== premier) throw new Error('D2: la régénération n\'a pas restauré la sortie');

      // ---- D3 : DÉRIVATION, pas transcription. Une valeur déplacée à la source
      // doit bouger dans la sortie. Une copie prise une fois passerait D1, D2 et
      // D4 sans broncher, et mourrait ici.
      editJson('tokens/primitives.tokens.json', (t: any) => {
        if (t?.radius?.['32']?.$value !== '32px') {
          throw new Error(`D3: dérive de fixture — primitives radius.32 vaut ${JSON.stringify(t?.radius?.['32']?.$value)}, "32px" attendu`);
        }
        t.radius['32'].$value = '7px';
      });
      if (buildTokens().status !== 0) throw new Error('D3: build-tokens a échoué après mutation d\'un jeton source');
      if (assets().status !== 0) throw new Error('D3: odoo:assets a échoué après mutation d\'un jeton source');
      const mute = /--pqr-radius-32:\s*([^;]+);/.exec(readFileSync(abs(TOKENS), 'utf8'));
      if (!mute) throw new Error('D3: --pqr-radius-32 a disparu de la sortie');
      if (mute[1].trim() !== '7px') {
        throw new Error(`D3: la source vaut 7px mais la sortie Odoo lit encore ${mute[1].trim()} — transcrite une fois, pas dérivée`);
      }
    }),
  },
  {
    // 019 — la couverture des décisions d'authoring. Aucun verdict par défaut :
    // une prop ou une part sans décision est un TROU, et un trou dans une
    // politique d'édition se découvre en production.
    //
    // Quatre refus, chacun exigé PAR SON NOM :
    //   R1  une occurrence sans verdict est nommée par son adresse canonique ;
    //   R2  une adresse qui ne résout vers aucune occurrence est refusée ;
    //   R3  une version fausse est distinguée d'un chemin faux ;
    //   R4  un sélecteur non préfixé par la racine est refusé — sans quoi deux
    //       instances de la même section partageraient leurs contrôles.
    id: 'odoo-authoring-coverage-refusal',
    claim: 'C2-refusal',
    run: () => avecSchemasOdoo(() => {
      const gate = (fixture: string) =>
        run(TSX, ['scripts/odoo/check-authoring.ts', '--config', `evals/fixtures/odoo-production/${fixture}/presentation.authoring.json`]);

      // ---- R1 : verdicts manquants, nommés par adresse canonique.
      const manque = gate('missing-verdict');
      if (manque.status === 0) throw new Error('R1: une config amputée de ses verdicts a été acceptée');
      if (!manque.out.includes('manquant :')) throw new Error(`R1: le refus ne liste aucun verdict manquant :\n${manque.out}`);
      // L'adresse doit être CANONIQUE : le chemin de composants, pas un nom court.
      if (!/manquant : ds\.presentation \/ SectionHeader→ds\.section-header/.test(manque.out)) {
        throw new Error(`R1: les manquants ne portent pas leur adresse canonique :\n${manque.out}`);
      }
      // Et l'occurrence DOUBLE de ds.button doit apparaître par ses DEUX chemins :
      // une table indexée par nom les confondrait en un seul bouton.
      const cheminsBouton = new Set(
        [...manque.out.matchAll(/manquant : (.*?ds\.button) ::/g)].map((m) => m[1]),
      );
      if (cheminsBouton.size !== 2) {
        throw new Error(`R1: ds.button attendu par 2 chemins d'occurrence distincts, ${cheminsBouton.size} vu(s) :\n${[...cheminsBouton].join('\n')}`);
      }

      // ---- R2/R3/R4 : chemin inexistant, version fausse, sélecteur non préfixé.
      const invalide = gate('invalid-path');
      if (invalide.status === 0) throw new Error('R2: une config aux adresses invalides a été acceptée');
      if (!invalide.out.includes('chemin sans occurrence')) throw new Error(`R2: un chemin inexistant n'est pas refusé par son nom :\n${invalide.out}`);
      if (!/version épinglée ds\.section-header@9\.9\.9/.test(invalide.out)) {
        throw new Error(`R3: une version fausse n'est pas distinguée d'un chemin faux :\n${invalide.out}`);
      }
      if (!/non préfixé par « \.s_pqr_presentation »/.test(invalide.out)) {
        throw new Error(`R4: un sélecteur non préfixé par la racine n'est pas refusé :\n${invalide.out}`);
      }

      // ---- Contre-épreuve : la porte n'est pas rouge par principe. Une config
      // absente est refusée AUSSI, mais en le disant autrement — sans quoi les
      // quatre refus ci-dessus ne prouveraient rien de plus qu'un script cassé.
      const absente = run(TSX, ['scripts/odoo/check-authoring.ts', '--config', 'integrations/odoo/config/inexistante.authoring.json']);
      if (absente.status === 0) throw new Error('la porte accepte une config absente');
      if (!absente.out.includes("config(s) d'authoring absente(s)")) {
        throw new Error(`une config absente doit être nommée comme telle, pas confondue avec un défaut de couverture :\n${absente.out}`);
      }
    }),
  },
  {
    id: 'odoo-production-derivation-report',
    claim: 'C2-refusal',
    run: () => avecSchemasOdoo(() => {
      const REGISTRY_REL = 'integrations/odoo/config/adaptation-registry.json';
      const reportPath = path.join(SCRATCH, 'integrations/odoo/derivation-report.json');
      const registryPath = path.join(SCRATCH, REGISTRY_REL);
      const bridgePath = path.join(SCRATCH, 'integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css');
      const build = (...args: string[]) => run(TSX, ['scripts/odoo/build-derivation-report.ts', ...args]);
      /** Reconstruit, puis rend le rapport relu. */
      const rebuild = () => { build(); return JSON.parse(readFileSync(reportPath, 'utf8')); };
      const firstRun = build();
      if (firstRun.status !== 0) throw new Error(`rapport canonique rouge:\n${firstRun.out}`);
      const first = readFileSync(reportPath, 'utf8');
      if (build().status !== 0 || readFileSync(reportPath, 'utf8') !== first) throw new Error('rapport non déterministe ×2');

      const originalRegistry = readFileSync(registryPath, 'utf8');
      const originalBridge = readFileSync(bridgePath, 'utf8');
      // La restauration réécrit les OCTETS d'origine, jamais un re-formatage :
      // `editJson` normalise l'indentation, ce qui ne doit pas fuir d'un volet
      // à l'autre.
      const restoreRegistry = () => writeFileSync(registryPath, originalRegistry);

      editJson(REGISTRY_REL, (r) => { r.adaptations.reverse(); r.reasonCodes.reverse(); });
      if (build().status !== 0 || readFileSync(reportPath, 'utf8') !== first) throw new Error('ordre du registre influence la sérialisation');

      restoreRegistry();
      editJson(REGISTRY_REL, (r) => { r.adaptations.pop(); });
      if (rebuild().unclassified.blocks.length === 0) throw new Error('bloc sans registre non détecté');

      restoreRegistry();
      editJson(REGISTRY_REL, (r) => {
        r.adaptations.push({ ...r.adaptations[0], adaptationId: 'ODOO-019-REGISTRY-WITHOUT-BLOCK' });
      });
      if (!rebuild().unclassified.registryEntries.includes('ODOO-019-REGISTRY-WITHOUT-BLOCK')) throw new Error('registre sans bloc non détecté');

      restoreRegistry();
      writeFileSync(bridgePath, `${originalBridge}\n/* ODOO-019-OUTER BEGIN */\n/* ODOO-019-INNER BEGIN */\n/* ODOO-019-INNER END */\n/* ODOO-019-OUTER END */\n`);
      if (!rebuild().unclassified.blocks.some((value: string) => value.startsWith('imbrique/'))) throw new Error('marqueurs chevauchants non détectés');
    }),
  },
  {
    id: 'odoo-production-version-drift',
    claim: 'C3-detection',
    run: () => avecSchemasOdoo(() => {
      const out = path.join(SCRATCH, 'version-report.json');
      const scan = () => run(TSX, [
        'scripts/odoo/scan-saved-versions.ts',
        '--input', 'evals/fixtures/odoo-production/version-drift/cases.json',
        '--out', out,
      ]);
      const result = scan();
      if (result.status !== 0) throw new Error(`scanner version rouge:\n${result.out}`);
      const report = JSON.parse(readFileSync(out, 'utf8'));
      const states = Object.fromEntries(report.entries.map((entry: any) => [entry.caseId, entry.state]));
      for (const expected of ['current', 'policy-stale', 'structure-stale', 'unknown']) {
        if (states[expected] !== expected) throw new Error(`${expected}: état ${states[expected] ?? '(absent)'}`);
      }
      const first = readFileSync(out, 'utf8');
      const second = scan();
      if (second.status !== 0 || readFileSync(out, 'utf8') !== first) throw new Error('scanner version non déterministe');
    }),
  },
  {
    id: 'accordion-row-source-cleanup-extraction',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/accordion-row-source-cleanup-check.ts']);
      if (r.status !== 0) throw new Error(`AccordionRow source-cleanup extraction receipt failed:\n${r.out}`);
      if (!r.out.includes('✔ AccordionRow source-cleanup extraction receipt holds')) {
        throw new Error(`AccordionRow source-cleanup extraction receipt did not reach its success verdict:\n${r.out}`);
      }
    },
  },
  {
    id: 'baseline-parity-clean',
    claim: 'C3-detection',
    run: () => {
      const r = parity();
      if (r.status !== 0) throw new Error(`Baseline not clean:\n${r.out}`);
    },
  },
  {
    id: 'figma-font-family-from-token',
    claim: 'C3-detection',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/figma-font-family-from-token-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-font-family-from-token rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-text-styles-piqueray',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-text-styles-piqueray-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-text-styles-piqueray rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-border-color-without-width',
    claim: 'C3-detection',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/figma-border-color-without-width-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-border-color-without-width rouge:\n${r.out}`);
    },
  },
  {
    id: 'absolute-part-out-of-flow',
    claim: 'C3-detection',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/absolute-part-out-of-flow-check.ts']);
      if (r.status !== 0) throw new Error(`fixture absolute-part-out-of-flow rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-campaign-gates',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/campaign-gates-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-campaign-gates rouge:\n${r.out}`);
    },
  },
  {
    id: 'component-repair-workflow-gates',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/component-workflow-gates-check.ts']);
      if (r.status !== 0) throw new Error(`fixture component-repair-workflow-gates rouge:\n${r.out}`);
    },
  },
  {
    id: 'component-repair-source-baseline',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/source-baseline-check.ts']);
      if (r.status !== 0) throw new Error(`fixture component-repair-source-baseline rouge:\n${r.out}`);
    },
  },
  {
    id: 'component-repair-protected-facts',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/protected-facts-check.ts']);
      if (r.status !== 0) throw new Error(`fixture component-repair-protected-facts rouge:\n${r.out}`);
    },
  },
  {
    id: 'component-repair-live-apply-receipt',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/live-apply-receipt-check.ts']);
      if (r.status !== 0) throw new Error(`fixture component-repair-live-apply-receipt rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-absolute-lowering',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/absolute-lowering-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-absolute-lowering rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-direct-geometry',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/direct-geometry-repair-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-direct-geometry rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-growing-image-proportions',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/growing-image-proportions-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-growing-image-proportions rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-bounded-grid',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/bounded-grid-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-bounded-grid rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-composed-parent-prop-forwarding',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/composed-parent-prop-forwarding-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-composed-parent-prop-forwarding rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-icon-instance-swap-visible',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/icon-instance-swap-visible-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-icon-instance-swap-visible rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-shared-consumer-impact',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/shared-consumer-impact-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-shared-consumer-impact rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-reconstruction-idempotence',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/reconstruction-idempotence-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-reconstruction-idempotence rouge:\n${r.out}`);
    },
  },
  {
    id: 'figma-projection-repair-repair-receipt-gates',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-projection-repair/repair-receipt-gates-check.ts']);
      if (r.status !== 0) throw new Error(`fixture figma-projection-repair-repair-receipt-gates rouge:\n${r.out}`);
    },
  },
  {
    id: 'icon-size-tokens-by-prop',
    claim: 'C3-detection',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/icon-size-tokens-by-prop-check.ts']);
      if (r.status !== 0) throw new Error(`fixture icon-size-tokens-by-prop rouge:\n${r.out}`);
    },
  },
  {
    id: 'dep-resolved-by-marker',
    claim: 'C3-detection',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/dep-resolved-by-marker-check.ts']);
      if (r.status !== 0) throw new Error(`fixture dep-resolved-by-marker rouge:\n${r.out}`);
    },
  },
  {
    id: 'composed-child-slot-content',
    claim: 'C1-determinism',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/composed-child-slot-content-check.ts']);
      if (r.status !== 0) throw new Error(`fixture composed-child-slot-content rouge:\n${r.out}`);
    },
  },
  {
    id: 'zero-height-line-part',
    claim: 'C1-determinism',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/zero-height-line-part-check.ts']);
      if (r.status !== 0) throw new Error(`fixture zero-height-line-part rouge:\n${r.out}`);
    },
  },
  {
    id: 'text-prop-and-visible-refs-coexist',
    claim: 'C1-determinism',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/text-prop-and-visible-refs-coexist-check.ts']);
      if (r.status !== 0) throw new Error(`fixture text-prop-and-visible-refs-coexist rouge:\n${r.out}`);
    },
  },
  {
    id: 'text-fills-constrained-parent',
    claim: 'C1-determinism',
    run: () => {
      // 016 — fixture du jour branchée sur la porte (revue adversariale, finding 2 :
      // une fixture que rien ne lance ne protège rien).
      const r = run(TSX, ['evals/fixtures/text-fills-constrained-parent-check.ts']);
      if (r.status !== 0) throw new Error(`fixture text-fills-constrained-parent rouge:\n${r.out}`);
    },
  },
  {
    id: 'primitives-border-width-parity',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/primitives-border-width-parity-check.ts']);
      if (r.status !== 0) throw new Error(`Immutable Figma border-width reference check failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-campaign-schema-guards',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-campaign-schema-check.ts']);
      if (r.status !== 0) throw new Error(`Visual campaign schema guard failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-layout-context-size',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-layout-context-size-check.ts']);
      if (r.status !== 0) throw new Error(`Visual layout-context size check failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-parity-font-faces',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-parity-font-face-check.ts']);
      if (r.status !== 0 || !r.out.includes('real Montserrat 700 face')) {
        throw new Error(`Visual parity font-face check failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'figma-render-bounds-alignment',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-render-bounds-alignment-check.ts']);
      if (r.status !== 0) throw new Error(`Figma render-bounds alignment check failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-evidence-integrity-guards',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-evidence-integrity-check.ts']);
      if (r.status !== 0) throw new Error(`Visual evidence integrity guard failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-campaign-011-exact-coverage',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-campaign-011-coverage-check.ts']);
      if (r.status !== 0) throw new Error(`011 visual campaign coverage guard failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-campaign-slot-comparison',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-campaign-slot-comparison-check.ts']);
      if (r.status !== 0) throw new Error(`Visual campaign restricted-slot comparison guard failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-campaign-scope-additive',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-campaign-scope-additive-check.ts']);
      if (r.status !== 0) throw new Error(`Additive campaign scope guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-campaign-scope',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-campaign-scope-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit campaign scope guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-wave-entry',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-wave-entry-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit wave-entry guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-verdict-algebra',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-verdict-algebra-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit verdict algebra guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-probative-evidence',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-probative-evidence-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit probative/pixel guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-dependency-mapping',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-dependency-mapping-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit dependency mapping guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-blocked-parent',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-blocked-parent-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit blocked-parent dossier guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-non-conversion',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-non-conversion-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit non-conversion receipt guard failed:\n${r.out}`);
    },
  },
  {
    id: 'declared-inset-channels',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/declared-inset-channels-check.ts']);
      if (r.status !== 0) throw new Error(`Declared inset-channel check failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-contract-pin',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-contract-pin-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit contract-pin guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-react-capture',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-react-capture-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit React capture guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-prop-projection',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-prop-projection-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit prop-projection guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-image-prop-path',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-image-prop-path-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit image prop-path guard failed:\n${r.out}`);
    },
  },
  {
    id: 'organism-audit-token-resolution',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-token-resolution-check.ts']);
      if (r.status !== 0) throw new Error(`Organism audit token-resolution guard failed:\n${r.out}`);
    },
  },
  // 015/D9 (FR-005) — the geometry loop detected on BOTH sides, demonstrated
  // not deduced (SC-002: 2/2). Code side: the differ's own code<->contract
  // axis (parity/diff.ts's cssVars check, added by 015) reads the ACTUAL
  // shipped CSS Module, so a var(--space-…) reference reverted to its raw
  // value is caught — never regenerated away first.
  {
    id: 'geometry-detection-code-side',
    claim: 'C3-detection',
    run: () => {
      // Button.root's gap is the ONLY declaration in Button.module.css that
      // consumes var(--space-10) (extract-code.ts's cssVars is a file-WIDE
      // set, not per-declaration — a token reused elsewhere in the same file
      // would still show "consumed" after this one reference is reverted).
      replaceInFile('src/components/Button/Button.module.css', 'gap: var(--space-10);', 'gap: 10px;');
      const r = parity();
      if (r.status === 0) throw new Error('A reverted var(--space-…) reference must fail parity, but it passed');
      expectFinding(readReport(), 'code', 'behind', 'Button.root#gap');
    },
  },
  // Canvas side: `compareFigmaExpectation` (extract/figma/organism-audit/
  // facts.ts) is the pure comparator the audit pilot calls per captured
  // fact — data-only, exercised against the REAL token source exactly like
  // organism-audit-token-resolution-check (never live Figma, FR-010). A
  // geometric channel's captured value, mutated as a fresh dump COPY would
  // read differently, must report a divergence localized to that fact.
  {
    id: 'geometry-detection-canvas-side',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/geometry-detection-canvas-side-check.ts']);
      if (r.status !== 0) throw new Error(`Geometry canvas-side detection check failed:\n${r.out}`);
    },
  },
  {
    id: 'field-slotted-control-semantics',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/field-slotted-control-semantics-check.ts']);
      if (r.status !== 0) throw new Error(`Field slotted-control semantics check failed:\n${r.out}`);
    },
  },
  {
    id: 'declared-object-position',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/object-position-declared-check.ts']);
      if (r.status !== 0) throw new Error(`Declared object-position check failed:\n${r.out}`);
    },
  },
  {
    id: 'semantic-attribute-map',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/semantic-attribute-map-check.ts']);
      if (r.status !== 0) throw new Error(`Semantic attribute mapping check failed:\n${r.out}`);
    },
  },
  {
    id: 'tab-external-roving-context',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/tab-external-roving-context-check.ts']);
      if (r.status !== 0) throw new Error(`External Tab roving-context check failed:\n${r.out}`);
    },
  },
  {
    id: 'icon-glyph-geometry',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/icon-glyph-geometry-check.ts']);
      if (r.status !== 0) throw new Error(`Icon glyph geometry check failed:\n${r.out}`);
    },
  },
  {
    id: 'bounded-typography-geometry-justification',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/bounded-typography-geometry-justification-check.ts']);
      if (r.status !== 0) throw new Error(`Bounded typography geometry justification check failed:\n${r.out}`);
    },
  },
  {
    id: 'component-scalar-propagation',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/component-scalar-propagation-check.ts']);
      if (r.status !== 0) throw new Error(`Component scalar propagation check failed:\n${r.out}`);
    },
  },
  {
    id: 'component-boolean-false-propagation',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/component-boolean-false-propagation-check.ts']);
      if (r.status !== 0) throw new Error(`Component boolean-false propagation check failed:\n${r.out}`);
    },
  },
  {
    id: 'literal-text-newline-preservation',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/literal-text-newline-preservation-check.ts']);
      if (r.status !== 0) throw new Error(`Literal-text newline preservation check failed:\n${r.out}`);
    },
  },
  {
    id: 'img-paint-preserved-on-amend',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/img-paint-preserved-on-amend-check.ts']);
      if (r.status !== 0) throw new Error(`Img-paint preservation check failed:\n${r.out}`);
    },
  },
  {
    // 017 (US1) — LA PORTE QUI FAIT FOI pour la classe photo, et elle tourne
    // partout, SANS le fichier client ouvert. Elle rejoue la perte du
    // 2026-08-06 (62 photos d'instance effondrées sur 10 sections de 8
    // maquettes, DERRIÈRE UN RAPPORT VERT) et porte les trois cas adverses
    // exigés par SC-002 — perte, interversion, empreinte sans accueil — plus
    // le déterminisme de SC-009.
    //
    // Pourquoi un cas d'eval et non une extension de `plugin:check` : les trois
    // cas de plugin:check sont en quarantaine et AUCUN cas actif ne les lance.
    // Une fixture que rien ne lance ne protège rien.
    //
    // Le reçu vif (npm run photos:verify sur le fichier client) CONFIRME ; il ne
    // remplace pas celui-ci. Le sans-tête fait foi.
    id: 'photos-instance-overrides-preserved',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/photos-instance-overrides-preserved-check.ts']);
      if (r.status !== 0) throw new Error(`Photos instance-override preservation check failed:\n${r.out}`);
    },
  },
  {
    id: 'component-rich-text-prop-value',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/component-rich-text-prop-value-check.ts']);
      if (r.status !== 0) throw new Error(`Component rich-text prop-value check failed:\n${r.out}`);
    },
  },
  {
    id: 'part-literal-rich-text',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/part-literal-rich-text-check.ts']);
      if (r.status !== 0) throw new Error(`Part literal rich-text check failed:\n${r.out}`);
    },
  },
  {
    id: 'repeat-enum-item-field',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/repeat-enum-item-field-check.ts']);
      if (r.status !== 0) throw new Error(`Repeat enum item-field check failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-probative-evidence',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-probative-evidence-check.ts']);
      if (r.status !== 0) throw new Error(`Visual probative-evidence check failed:\n${r.out}`);
    },
  },
  {
    id: 'fractional-image-receipt',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/fractional-image-receipt-check.ts']);
      if (r.status !== 0) throw new Error(`Fractional image receipt check failed:\n${r.out}`);
    },
  },
  {
    id: 'campaign-capture-scale',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/campaign-capture-scale-check.ts']);
      if (r.status !== 0) throw new Error(`Campaign capture-scale check failed:\n${r.out}`);
    },
  },
  {
    id: 'jpeg-exif-orientation-dimensions',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/jpeg-exif-orientation-dimensions-check.ts']);
      if (r.status !== 0) throw new Error(`JPEG EXIF orientation dimension check failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-regions-and-geometry',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-regions-geometry-check.ts']);
      if (r.status !== 0) throw new Error(`Visual regions/geometry check failed:\n${r.out}`);
    },
  },
  {
    id: 'visual-attribution-audit',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-attribution-audit-check.ts']);
      if (r.status !== 0) throw new Error(`Visual attribution audit check failed:\n${r.out}`);
    },
  },
  {
    id: 'baseline-acknowledges-without-failing',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s2) => { s2.fileKey = 'WRONG_FILE_KEY'; });
      // Merge with the repo baseline rather than replacing it — the claim under
      // test is "a baselined finding stops failing the exit code", which must
      // hold regardless of what in-flight drift the repo already acknowledges.
      let existing = [];
      try { existing = JSON.parse(readFileSync(path.join(SCRATCH, 'parity', 'baseline.json'), 'utf8')); } catch { /* none */ }
      writeFileSync(path.join(SCRATCH, 'parity', 'baseline.json'),
        JSON.stringify([...existing, 'figma|mismatch|snapshot-provenance']) + '\n');
      const r = parity();
      if (r.status !== 0) throw new Error('Baselined finding still failed the exit code');
      const report = JSON.parse(readFileSync(path.join(SCRATCH, 'parity', 'report.json'), 'utf8'));
      if (!report.acknowledged?.some((f: { subject: string }) => f.subject === 'snapshot-provenance') || report.findings.length !== 0)
        throw new Error('Baselined finding not routed to acknowledged');
    },
  },
  {
    id: 'promotion-converges',
    claim: 'C4-convergence',
    run: () => {
      // 1. Code drifts ahead.
      replaceInFile(BTN_TSX, VARIANT_DECL, `${VARIANT_DECL}\n  iconOnly?: boolean;`);
      // 002-governed-icons-button: v1.3's extra destructured props push the
      // generator's param block onto multiple lines — anchor on the stable
      // `variant = 'default',` line itself, not the preceding brace.
      replaceInFile(BTN_TSX, "    variant = 'default',", "    variant = 'default',\n    iconOnly = false,");
      if (parity().status === 0) throw new Error('Drift not detected');
      const patch = expectFinding(readReport(), 'code', 'ahead', 'Button.iconOnly').proposedPatch;
      if (!patch) throw new Error('No promotion patch proposed');
      // 2. Promote: apply the differ's own patch to the contract.
      editJson(CONTRACT, (c) => {
        c.props.push(patch);
        c.version = '1.4.0';
      });
      // 3. Regenerate code from the amended contract.
      if (generate().status !== 0) throw new Error('Regeneration after promotion failed');
      // 4. Converged: no code findings remain; the ONLY finding is the correct
      //    next step — Figma is now behind (needs the IconOnly property).
      parity();
      const after = readReport();
      if (after.some((f) => f.surface === 'code'))
        throw new Error(`Code findings remain: ${JSON.stringify(after)}`);
      expectFinding(after, 'figma', 'behind', 'Button.IconOnly');
      if (after.length !== 1) throw new Error(`Unexpected extra findings: ${JSON.stringify(after)}`);
    },
  },
  // ---------------------------------------------------------------------------
  // 002-governed-icons-button — the icon registry's three-way guarantee (C3)
  // and its build-time refusal (C2).
  // ---------------------------------------------------------------------------
  {
    id: 'detect-icon-registry-divergence',
    claim: 'C3-detection',
    run: () => {
      // Seed a divergence on ONE side only (remove "cart" from the registry;
      // its code asset and its canvas swap-menu presence are untouched) — the
      // icons axis must catch it from BOTH directions at once (FR-007: never
      // silent, whichever side actually diverged).
      editJson('contracts/icons.registry.json', (r) => {
        r.icons = r.icons.filter((i: { name: string }) => i.name !== 'cart');
      });
      if (parity().status === 0) throw new Error('Seeded icon-registry divergence not detected');
      const report = readReport();
      expectFinding(report, 'icons', 'ahead', 'assets/icons/cart.svg');
      expectFinding(report, 'icons', 'ahead', 'figma/Cart');
    },
  },
  {
    id: 'refuse-unregistered-icon-enum',
    claim: 'C2-refusal',
    run: () => {
      // An INSTANCE_SWAP-bound enum that overlaps the registry (so it reads as
      // an icon-choice prop) but names a value the registry doesn't have —
      // refused BY NAME (FR-008 edge), never silently generated.
      editJson(CONTRACT, (c) => {
        c.props.push({
          name: 'testGlyph',
          description: 'Eval fixture — an icon-choice prop with an out-of-registry value.',
          type: { enum: ['arrow-left', 'not-a-real-icon'] },
          default: 'arrow-left',
          bindings: {
            figma: { kind: 'INSTANCE_SWAP', property: 'Test Glyph', values: { 'arrow-left': 'arrow-left', 'not-a-real-icon': 'not-a-real-icon' } },
            code: { prop: 'testGlyph' },
          },
        });
      });
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted an INSTANCE_SWAP enum value outside the icon registry');
      if (!r.out.includes('not-a-real-icon')) throw new Error(`Refusal did not name the offending value: ${r.out}`);
    },
  },
  {
    id: 'lower-icon-swap-and-visibility-into-props',
    claim: 'C5-extraction',
    run: () => {
      // D5: propose-figma.ts's own extraction gap, closed — boolDefaults +
      // propRefs.visible recover boolean props, and swapPreferredValues +
      // the icon registry recover INSTANCE_SWAP enum props (never a slot —
      // there is no per-icon contract by design, D1). Runs the REAL CLI over
      // the REAL committed post-cleanup dump — rides the same fixture as D9.
      const r = run(TSX, ['extract/figma/propose.ts', 'extract/figma/fixtures/piqueray-button.dump.json']);
      if (r.status !== 0) throw new Error(`extract:figma failed:\n${r.out}`);
      const proposed = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract', 'out', 'figma', 'bouton.contract.proposed.json'), 'utf8'),
      );
      const props = proposed.props as Array<{
        name: string;
        type?: unknown;
        default?: unknown;
        bindings: { figma: { kind: string; property: string; values?: Record<string, string> } };
      }>;

      const boolLeft = props.find((p) => p.bindings.figma.kind === 'BOOLEAN' && p.bindings.figma.property === 'Icône gauche');
      if (!boolLeft || boolLeft.default !== false) {
        throw new Error(`expected a BOOLEAN prop for "Icône gauche" defaulting false (dump v1.5 boolDefaults) — got ${JSON.stringify(boolLeft)}`);
      }

      const swapLeft = props.find((p) => p.bindings.figma.kind === 'INSTANCE_SWAP' && p.bindings.figma.property === 'Glyphe gauche');
      if (!swapLeft) throw new Error(`expected an INSTANCE_SWAP enum prop bound to "Glyphe gauche" — props: ${props.map((p) => p.name).join(', ')}`);
      if (swapLeft.default !== 'arrow-left') {
        throw new Error(`expected default "arrow-left" (the observed default-variant instance) — got ${JSON.stringify(swapLeft.default)}`);
      }
      const enumValues = (swapLeft.type as { enum: string[] }).enum;
      if (enumValues.length !== 13 || !enumValues.includes('cart') || enumValues.includes('mail') || enumValues.includes('external-link')) {
        throw new Error(`expected the enum to equal the 13-icon registry exactly (no mail/external-link) — got: ${enumValues.join(', ')}`);
      }
      if (swapLeft.bindings.figma.values?.['arrow-left'] !== 'ArrowLeft') {
        throw new Error(`expected bindings.figma.values to map canonical "arrow-left" → figma.componentName "ArrowLeft" — got ${JSON.stringify(swapLeft.bindings.figma.values)}`);
      }

      const iconPart = Object.values(proposed.anatomy.root.parts as Record<string, { icon?: { asset?: string; size?: number } }>).find(
        (p) => p.icon?.asset === `{${swapLeft.name}}`,
      );
      if (!iconPart) throw new Error(`expected an anatomy part with icon.asset "{${swapLeft.name}}" (the enum-substitution convention) — never a slot`);
      if (iconPart.icon?.size !== 20) throw new Error(`expected icon.size 20 (the observed instance bbox) — got ${iconPart.icon?.size}`);
    },
  },
  {
    id: 'preserve-nested-empty-boolean-and-swap-props',
    claim: 'C5-extraction',
    run: () => {
      // Raw REST fixture → real mapper → real proposer. A nested Button's
      // empty TEXT, false BOOLEAN and INSTANCE_SWAP selections are all
      // meaningful fixed values; none may be mistaken for absence.
      const r = run(TSX, ['extract/figma/nested-instance-props-check.ts']);
      if (r.status !== 0) throw new Error(`nested instance props receipt failed:\n${r.out}`);
      for (const line of [
        '✔ REST mapper preserves empty nested TEXT values',
        '✔ REST mapper preserves nested BOOLEAN true/false values',
        '✔ REST mapper resolves nested INSTANCE_SWAP ids to ChevronLeft/ChevronRight',
        '✔ proposer canonicalizes all fixed values through ds.button without dropping falsy values',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Revived from evals/legacy-cases.ts (D9.4): census guard 4 — the census
    // found the canvas surface was the one emitter that never called
    // validateContract, so every referee-violating set still emitted a sync
    // script. Extracted to its own standalone script (figma-script-referee-
    // check.ts) and re-homed onto ds.button — the claim itself was never
    // demo-specific (ds.badge no longer exists post-reconversion); it was
    // quarantined only because the receipt it rode also needed ds.avatar for
    // an unrelated section (still blocked — the rest of that receipt stays
    // quarantined in legacy-cases.ts, updated reason).
    id: 'figma-script-referees-invalid-contracts',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['extract/figma/gauntlet/figma-script-referee-check.ts']);
      if (r.status !== 0) throw new Error(`figma-script referee receipt failed:\n${r.out}`);
      for (const line of [
        '✔ emitFigmaScript REFUSES the invalid contract (no sync script emitted)',
        '✔ the refusal is NAMED with the emitReact wording ("Refused — 1 contract violation(s)")',
        '✔ the violation names the part and prop (visibleWhen references unknown prop "nonexistent")',
        '✔ the VALID repo contract still emits its sync script (golden untouched)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Revived from evals/legacy-cases.ts (D9.4), re-pointed to real Piqueray
    // facts instead of the deleted demo's Button.Loading/Label/size and
    // Slider.value: 3 of the original 5 drift classes are testable today
    // against ds.button's own BOOLEAN prop (iconLeft ↔ "Icône gauche") and
    // its own generated code. 2 stay out: "figma text default change" needs
    // an EXISTING TEXT property on the committed canvas snapshot, and
    // ds.button has none yet (the 001 finding — closes at Step 3, not a
    // structural gap); "numeric code default drift" needs a numeric prop,
    // which no Piqueray contract declares (a genuine, not temporary, gap —
    // inventing one just for this eval would misrepresent the component).
    id: 'detect-default-and-kind-drift',
    claim: 'C3-detection',
    run: () => {
      const check = (label: string, surface: string, cls: string, subject: string, mutate: () => void, restore: () => void) => {
        mutate();
        const r = parity();
        try {
          if (r.status === 0) throw new Error(`${label}: NOT detected`);
          expectFinding(readReport(), surface, cls, subject);
        } finally {
          restore();
        }
      };
      const figmaSnap = readFileSync(path.join(SCRATCH, FIGMA_COMPONENTS), 'utf8');
      check(
        'figma boolean default flip',
        'figma',
        'mismatch',
        'Button.Icone gauche (default)',
        () =>
          editJson(FIGMA_COMPONENTS, (snap) => {
            const btn = snap.sets.find((x: any) => x.name === FIGMA_SET);
            const key = Object.keys(btn.properties).find((k: string) => k.startsWith('Icone gauche'))!;
            btn.properties[key].defaultValue = true;
          }),
        () => writeFileSync(path.join(SCRATCH, FIGMA_COMPONENTS), figmaSnap),
      );
      check(
        'figma property kind change',
        'figma',
        'mismatch',
        'Button.Icone gauche (kind)',
        () =>
          editJson(FIGMA_COMPONENTS, (snap) => {
            const btn = snap.sets.find((x: any) => x.name === FIGMA_SET);
            const key = Object.keys(btn.properties).find((k: string) => k.startsWith('Icone gauche'))!;
            btn.properties[key].type = 'TEXT';
          }),
        () => writeFileSync(path.join(SCRATCH, FIGMA_COMPONENTS), figmaSnap),
      );
      const btnSrc = readFileSync(path.join(SCRATCH, BTN_TSX), 'utf8');
      check(
        'deleted code default',
        'code',
        'mismatch',
        'Button.variant (default)',
        () => replaceInFile(BTN_TSX, "variant = 'default',", 'variant,'),
        () => writeFileSync(path.join(SCRATCH, BTN_TSX), btnSrc),
      );
    },
  },
  {
    id: 'refuse-unknown-token-reference',
    claim: 'C2-refusal',
    run: () => {
      replaceInFile(CONTRACT, '{radius.32}', '{radius.nonexistent}');
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted a nonexistent token reference');
      if (!r.out.includes('does not exist')) throw new Error('Missing token not named in error');
    },
  },
  {
    // v16 additive-optional provenance (research D4/D5): anchors.figma.dumpedAt
    // + a11y/semantics.provenance must ride the contract as first-class schema
    // vocabulary — surviving a schema parse, a JSON round-trip, AND the
    // generator's own shared refusal gate (validateContract) without error or
    // loss. Deliberately Button-independent so it stays green across (and
    // after) the Piqueray reconversion — fixture → eval → claim for the two
    // fields BEFORE any doc/contract relies on them (Principle II).
    id: 'provenance-fields-survive-roundtrip',
    claim: 'C1-determinism',
    run: () => {
      const fixture = {
        id: 'ds.provenancefixture',
        name: 'ProvenanceFixture',
        version: '1.0.0',
        description: 'Eval fixture: v16 provenance + dumpedAt round-trip.',
        semantics: { element: 'button', role: 'button', provenance: 'authored' },
        props: [],
        anatomy: { root: { tokens: {} } },
        a11y: { focusVisible: true, minHitArea: 44, contrast: 'AA', provenance: 'authored' },
        anchors: {
          figma: { fileKey: 'FILE', componentSetKey: 'SET', nodeId: '6:122', dumpedAt: '2026-07-22' },
          code: { importPath: 'src/components/ProvenanceFixture', export: 'ProvenanceFixture' },
        },
      };
      const preserved = (c: SchemaContract, where: string) => {
        if (c.semantics.provenance !== 'authored') throw new Error(`semantics.provenance dropped (${where})`);
        if (c.a11y?.provenance !== 'authored') throw new Error(`a11y.provenance dropped (${where})`);
        if (c.anchors.figma.dumpedAt !== '2026-07-22') throw new Error(`anchors.figma.dumpedAt dropped (${where})`);
      };
      // Round-trip #1: the schema gate parses and preserves all three fields.
      const parsed = ContractSchema.parse(fixture);
      preserved(parsed, 'schema parse');
      // Round-trip #2: serialize → re-parse is idempotent on the fields.
      preserved(ContractSchema.parse(JSON.parse(JSON.stringify(parsed))), 'json round-trip');
      // "Survive generate": the generator's shared refusal gate accepts a
      // contract carrying the additive fields (they never fail it by name).
      const errs: string[] = [];
      coreValidateContract(parsed, new Map([[parsed.id, parsed]]), errs, new Map());
      if (errs.length > 0) throw new Error(`validateContract rejected provenance-carrying contract: ${errs.join('; ')}`);
    },
  },
  {
    id: 'refuse-schema-invalid-contract',
    claim: 'C2-refusal',
    run: () => {
      editJson(CONTRACT, (c) => delete c.semantics);
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted a contract missing semantics');
    },
  },
  {
    // v17 category (spec 004): an unknown category value is refused BY NAME —
    // the Zod enum names the field at the schema layer, and the generator
    // fails loudly (never silently generates a mis-categorized surface).
    // Fixture → eval → claim: proven BEFORE any doc/surface relies on category.
    id: 'refuse-unknown-category',
    claim: 'C2-refusal',
    run: () => {
      let named = false;
      try {
        ContractSchema.parse({
          id: 'ds.categoryfixture', name: 'CategoryFixture', version: '1.0.0',
          category: 'atome', // out of enum ('atom' | 'molecule' | 'section')
          description: 'Eval fixture: v17 category refusal.',
          semantics: { element: 'div' }, props: [],
          anatomy: { root: { tokens: {} } },
          anchors: {
            figma: { fileKey: null, componentSetKey: null },
            code: { importPath: 'src/components/CategoryFixture', export: 'CategoryFixture' },
          },
        });
      } catch (e) {
        named = /category/.test(String(e));
      }
      if (!named) throw new Error('Unknown category not refused by name at the schema layer');
      // Build layer: mutating a real contract to a bad category fails the build.
      editJson(CONTRACT, (c) => { c.category = 'atome'; });
      if (generate().status === 0) throw new Error('Generator accepted an unknown category value');
    },
  },
  {
    // v17 category tolerance (spec 004, FR-013): a contract WITHOUT a category
    // stays valid (category is additive-optional) and its story falls back to
    // the `Components/` group — the pre-004 behavior, preserved. Backward
    // compatibility proven as a first-class check, not assumed.
    id: 'tolerate-contract-without-category',
    claim: 'C1-determinism',
    run: () => {
      const fixture = {
        id: 'ds.categoryfixture', name: 'CategoryFixture', version: '1.0.0',
        description: 'Eval fixture: v17 category tolerance.',
        semantics: { element: 'div' }, props: [],
        anatomy: { root: { tokens: {} } },
        anchors: {
          figma: { fileKey: null, componentSetKey: null },
          code: { importPath: 'src/components/CategoryFixture', export: 'CategoryFixture' },
        },
      };
      const parsed = ContractSchema.parse(fixture);
      if (parsed.category !== undefined) throw new Error('absent category must stay undefined (no default)');
      const { stories } = coreEmitReact(parsed, { tokens: new Set(), icons: new Map(), contracts: new Map() });
      if (!stories.includes("title: 'Components/CategoryFixture'")) {
        throw new Error(`no-category contract did not fall back to the Components/ group:\n${stories.slice(0, 400)}`);
      }
    },
  },
  {
    // v17 category grouping (spec 004, FR-012/015, SC-002/005): a categorized
    // contract drives BOTH generated surfaces from the single source —
    // (1) the Storybook story title is grouped under the category's label, and
    // (2) the catalog entry carries `category`. Fixture → eval → claim, proven
    // BEFORE any surface doc relies on the grouping.
    id: 'category-groups-story-and-catalog',
    claim: 'C6-theming',
    run: () => {
      // (1) Story title mirrors the category via the single label source.
      const atom = ContractSchema.parse({
        id: 'ds.categoryfixture', name: 'CategoryFixture', version: '1.0.0', category: 'atom',
        description: 'Eval fixture: v17 category grouping.',
        semantics: { element: 'div' }, props: [],
        anatomy: { root: { tokens: {} } },
        anchors: {
          figma: { fileKey: null, componentSetKey: null },
          code: { importPath: 'src/components/CategoryFixture', export: 'CategoryFixture' },
        },
      });
      const { stories } = coreEmitReact(atom, { tokens: new Set(), icons: new Map(), contracts: new Map() });
      if (!stories.includes("title: 'Atoms/CategoryFixture'")) {
        throw new Error(`atom contract did not emit the Atoms/ story group:\n${stories.slice(0, 400)}`);
      }
      // (2) The real catalog generator surfaces `category` for a categorized
      //     contract — Button carries category: "atom".
      const r = run(TSX, ['scripts/generate-catalog.ts']);
      if (r.status !== 0) throw new Error(`catalog generation failed:\n${r.out.slice(0, 600)}`);
      const cat = JSON.parse(readFileSync(path.join(SCRATCH, 'catalog', 'catalog.json'), 'utf8'));
      const btn = cat.components.find((c: { id: string; category?: string }) => c.id === 'ds.button');
      if (!btn) throw new Error('Button missing from the generated catalog');
      if (btn.category !== 'atom') {
        throw new Error(`catalog dropped the Button category: got ${JSON.stringify(btn.category)}`);
      }
    },
  },
  {
    // v17 native form control (spec 004, US1): a root whose element is an HTML
    // VOID element (input) must render SELF-CLOSING with (a) its root `attrs`
    // and (b) its text prop wired through `defaultValue` — never
    // `<input>{children}</input>` (invalid React) and never a dropped value.
    // The canvas draws that value as a text child (bound to the property,
    // exactly like the Button label); code collapses it onto the native input.
    // Regression guard: the demo-era generator rendered nested input PARTS
    // with attrs, but the ROOT path emitted `{children}` and ignored root
    // attrs. Fixture → eval → claim.
    id: 'native-input-root-void-self-closes-with-attrs',
    claim: 'C1-determinism',
    run: () => {
      const fixture = ContractSchema.parse({
        id: 'ds.inputfixture', name: 'InputFixture', version: '1.0.0',
        description: 'Eval fixture: native <input> root (void element).',
        semantics: { element: 'input' },
        props: [{
          name: 'value', type: 'text', default: 'x',
          bindings: { figma: { kind: 'TEXT', property: 'Valeur' }, code: { prop: 'value' } },
        }],
        // box root + a content-only text child (canvas draws it); the void
        // React element drops the child and carries the value via defaultValue.
        anatomy: { root: { attrs: { type: 'text' }, parts: { text: { element: 'span', content: { prop: 'value' } } } } },
        anchors: {
          figma: { fileKey: null, componentSetKey: null },
          code: { importPath: 'src/components/InputFixture', export: 'InputFixture' },
        },
      });
      const { tsx } = coreEmitReact(fixture, { tokens: new Set(), icons: new Map(), contracts: new Map() });
      if (tsx.includes('{children}')) throw new Error('void <input> root still renders {children} — invalid for a void element');
      if (!/<input\b[^>]*\/>/.test(tsx)) throw new Error('void <input> root is not self-closing');
      if (!tsx.includes('type="text"')) throw new Error('root attrs not rendered into JSX (type="text" missing)');
      if (!tsx.includes('defaultValue={String(value)}')) throw new Error('the text prop is not wired through defaultValue on the void element');
    },
  },
  {
    // v17 native form controls (spec 004, US1): the checkbox and select
    // patterns. A native checkable input reflects its state through
    // `defaultChecked` even with no declared event (the real DOM checked state
    // matches the drawn box — never a visual-only fake). A native <select>
    // wraps its shown value in an <option> (never a raw text child, invalid
    // HTML). Fixture → eval → claim for the two US1 generator additions.
    id: 'native-checkbox-and-select-render-correctly',
    claim: 'C1-determinism',
    run: () => {
      const icons = new Map([['check', '<svg/>'], ['chevron-down', '<svg/>']]);
      // Checkbox: box span + real <input type=checkbox> + custom check glyph.
      const checkbox = ContractSchema.parse({
        id: 'ds.checkboxfixture', name: 'CheckboxFixture', version: '1.0.0',
        description: 'Eval fixture: accessible custom checkbox.',
        semantics: { element: 'span' },
        props: [{
          name: 'checked', type: { enum: ['non', 'oui'] }, default: 'non',
          bindings: { figma: { kind: 'VARIANT', property: 'Coché', values: { non: 'Non', oui: 'Oui' } }, code: { prop: 'checked' } },
        }],
        anatomy: { root: { parts: {
          input: { element: 'input', attrs: { type: 'checkbox' } },
          checkGlyph: { icon: { asset: 'check', size: 12 }, visibleWhen: { prop: 'checked', equals: 'oui' } },
        } } },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'x', export: 'CheckboxFixture' } },
      });
      const cbx = coreEmitReact(checkbox, { tokens: new Set(), icons, contracts: new Map() }).tsx;
      if (!/type="checkbox"/.test(cbx)) throw new Error('checkbox: native input missing');
      if (!cbx.includes("defaultChecked={checked === 'oui'}")) throw new Error('checkbox: DOM checked not wired from state (a11y fake)');
      // Select: box div + native <select> (value as option) + chevron sibling.
      const select = ContractSchema.parse({
        id: 'ds.selectfixture', name: 'SelectFixture', version: '1.0.0',
        description: 'Eval fixture: native select in a wrapper.',
        semantics: { element: 'div' },
        props: [{
          name: 'value', type: 'text', default: 'x',
          bindings: { figma: { kind: 'TEXT', property: 'Valeur' }, code: { prop: 'value' } },
        }],
        anatomy: { root: { parts: {
          valeur: { element: 'select', content: { prop: 'value' } },
          chevron: { icon: { asset: 'chevron-down', size: 24 } },
        } } },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'x', export: 'SelectFixture' } },
      });
      const sel = coreEmitReact(select, { tokens: new Set(), icons, contracts: new Map() }).tsx;
      if (!/<option>\{value\}<\/option>/.test(sel)) throw new Error('select: value not wrapped in an <option> (invalid <select> child)');
      if (/<select[^>]*>\{value\}/.test(sel)) throw new Error('select: raw text child under <select> — invalid HTML');
    },
  },
  {
    // v17 internal glyph (spec 004, D7): an icon asset a contract consumes
    // through a FIXED icon.asset (the Checkbox's « check ») is NOT an orphan,
    // even without a registry entry — it is still Figma-born (exported from the
    // master's own Vector) and deliberately outside the governed registry. An
    // asset that is NEITHER registry-listed NOR consumed stays a finding.
    // Fixture → eval → claim, before any doc calls check an internal glyph.
    id: 'internal-glyph-consumed-not-orphan',
    claim: 'C3-detection',
    run: () => {
      // The repo ships ds.checkbox consuming assets/icons/check.svg (fixed).
      if (parity().status === undefined) throw new Error('parity did not run');
      const findings = readReport();
      if (findings.some((f) => f.surface === 'icons' && /check\.svg/.test(f.subject))) {
        throw new Error('check.svg flagged as an orphan despite being consumed by ds.checkbox');
      }
      // A genuine orphan (neither registry nor consumed) MUST still be flagged.
      writeFileSync(path.join(SCRATCH, 'assets', 'icons', 'zzz-orphan-fixture.svg'), '<svg/>\n');
      parity();
      const after = readReport();
      if (!after.some((f) => /zzz-orphan-fixture\.svg/.test(f.subject))) {
        throw new Error('a genuine orphan asset (not registry, not consumed) is not flagged — the class is too wide');
      }
    },
  },
  {
    id: 'deterministic-regeneration',
    claim: 'C1-determinism',
    run: () => {
      if (buildTokens().status !== 0 || generate().status !== 0) throw new Error('First build failed');
      const first = hashTree('src');
      if (buildTokens().status !== 0 || generate().status !== 0) throw new Error('Second build failed');
      if (hashTree('src') !== first) throw new Error('Regeneration is not byte-identical');
    },
  },
  {
    // 018 — the token pipeline's FOURTH output: a prefixed :root sheet written
    // into a hand-written Odoo module under specs/. Principle II puts this case
    // BEFORE docs/03-token-pipeline.md describes the output; it refuses each of
    // the seven invariants of
    // specs/018-odoo-replique-manuelle/contracts/odoo-tokens-output.md §4 BY NAME.
    //
    // Structural trap, verified rather than assumed: resetScratch() does NOT
    // copy specs/ (the directory list in harness.ts has no `specs` entry). The
    // output is therefore never staged — it is CREATED in the scratch by the
    // pipeline's own recursive mkdirSync. That same fact is the mechanical
    // reason it has no golden entry: scripts/update-golden.mjs walks only src/
    // and figma-sync/*.js.
    id: 'odoo-tokens-output',
    claim: 'C1-determinism',
    run: () => {
      const ODOO = path.join(
        'specs', '018-odoo-replique-manuelle', 'module', 'piqueray_ds',
        'static', 'src', 'css', 'tokens.pqr.css',
      );
      const PREFIX = '--pqr-';
      const EXISTING = ['src/styles/tokens.css', 'src/styles/tokens.dark.css', 'src/styles/tokens.brands.css'];
      const abs = (rel: string) => path.join(SCRATCH, rel);
      const sha = (rel: string) => createHash('sha256').update(readFileSync(abs(rel))).digest('hex');
      /** Every custom-property DECLARATION of a :root sheet, as [name, value]. */
      const decls = (css: string): Array<[string, string]> =>
        [...css.matchAll(/^\s*(--[\w-]+):\s*(.+?);$/gm)].map((m) => [m[1], m[2]]);

      // ---- I1 additivity: the three existing outputs must not move one byte.
      // The scratch stages them from the repo, so the pre-build hash IS the
      // committed state; rebuilding must reproduce it exactly.
      const before = EXISTING.map(sha);
      if (buildTokens().status !== 0) throw new Error('build-tokens failed on a clean scratch');
      if (!existsSync(abs(ODOO))) throw new Error(`I6: the fourth output was not written to ${ODOO}`);
      EXISTING.forEach((rel, i) => {
        if (sha(rel) !== before[i]) throw new Error(`I1: ${rel} changed — the fourth output is not additive`);
      });

      const first = readFileSync(abs(ODOO), 'utf8');

      // ---- I6 header: generated marker AND the command that remakes it.
      if (!/GENERATED FILE — DO NOT EDIT\./.test(first)) throw new Error('I6: no GENERATED — DO NOT EDIT marker');
      if (!/npm run tokens/.test(first)) throw new Error('I6: header does not name the regeneration command');

      // ---- I3 total prefix: one unprefixed declaration OR reference is a refusal.
      const odooDecls = decls(first);
      if (odooDecls.length === 0) throw new Error('I3/I4: the fourth output declares nothing');
      const bareDecl = odooDecls.find(([name]) => !name.startsWith(PREFIX));
      if (bareDecl) throw new Error(`I3: declaration without the ${PREFIX} prefix: ${bareDecl[0]}`);
      const bareRef = [...first.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]).find((n) => !n.startsWith(PREFIX));
      if (bareRef) throw new Error(`I3: alias reference without the ${PREFIX} prefix: var(${bareRef})`);

      // ---- I4 coverage: a BIJECTION with :root of tokens.css. Never a count —
      // the vocabulary grows, and a hardcoded number would rot silently.
      const rootNames = new Set(decls(readFileSync(abs('src/styles/tokens.css'), 'utf8')).map(([n]) => n));
      const odooNames = new Set(odooDecls.map(([n]) => n.slice(PREFIX.length)).map((n) => `--${n}`));
      const missing = [...rootNames].filter((n) => !odooNames.has(n));
      const extra = [...odooNames].filter((n) => !rootNames.has(n));
      if (missing.length > 0) throw new Error(`I4: ${missing.length} :root propert(ies) absent from the Odoo output, e.g. ${missing.slice(0, 3).join(', ')}`);
      if (extra.length > 0) throw new Error(`I4: ${extra.length} Odoo propert(ies) with no :root counterpart, e.g. ${extra.slice(0, 3).join(', ')}`);

      // ---- I2 determinism: twice, byte for byte.
      if (buildTokens().status !== 0) throw new Error('I2: second build-tokens failed');
      if (readFileSync(abs(ODOO), 'utf8') !== first) throw new Error('I2: two consecutive runs differ');

      // ---- I5 derivation, not transcription. THE adversarial check: a value
      // moved in the source must move in the output. A file copied once would
      // sail through I1–I4 and die here.
      editJson('tokens/primitives.tokens.json', (t: any) => {
        if (t?.radius?.['32']?.$value !== '32px') {
          throw new Error(`I5: fixture drift — primitives radius.32 is ${JSON.stringify(t?.radius?.['32']?.$value)}, expected "32px"`);
        }
        t.radius['32'].$value = '7px';
      });
      if (buildTokens().status !== 0) throw new Error('I5: build failed after mutating a source token');
      const mutated = decls(readFileSync(abs(ODOO), 'utf8')).find(([n]) => n === `${PREFIX}radius-32`);
      if (!mutated) throw new Error(`I5: ${PREFIX}radius-32 disappeared from the output`);
      if (mutated[1] !== '7px') throw new Error(`I5: source moved to 7px but the Odoo output still reads ${mutated[1]} — transcribed once, not derived`);

      // ---- I7 an unresolvable alias is still refused. The fourth output must
      // not open an escape hatch the other three close.
      editJson('tokens/semantic.tokens.json', (t: any) => {
        t['zzz-018-probe'] = { $value: '{does.not.exist}', $type: 'dimension' };
      });
      if (buildTokens().status === 0) throw new Error('I7: build passed with an alias pointing into the void');
    },
  },
  {
    id: 'detect-code-added-prop',
    claim: 'C3-detection',
    run: () => {
      replaceInFile(BTN_TSX, VARIANT_DECL, `${VARIANT_DECL}\n  iconOnly?: boolean;`);
      // 002-governed-icons-button: v1.3's extra destructured props push the
      // generator's param block onto multiple lines — anchor on the stable
      // `variant = 'default',` line itself, not the preceding brace.
      replaceInFile(BTN_TSX, "    variant = 'default',", "    variant = 'default',\n    iconOnly = false,");
      if (parity().status === 0) throw new Error('Drift not detected');
      const f = expectFinding(readReport(), 'code', 'ahead', 'Button.iconOnly');
      if ((f.proposedPatch as any)?.name !== 'iconOnly') throw new Error('Patch missing/incorrect');
    },
  },
  {
    id: 'detect-code-removed-prop',
    claim: 'C3-detection',
    run: () => {
      replaceInFile(BTN_TSX, /\s*\/\*\* Visual style of the button\. \*\/\n\s*variant\?: [^;]+;/, '');
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'code', 'behind', 'Button.variant');
    },
  },
  {
    id: 'detect-code-enum-drift',
    claim: 'C3-detection',
    run: () => {
      replaceInFile(BTN_TSX, "| 'outlineNoir'", "| 'outlineNoir' | 'ghost'");
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'code', 'mismatch', 'Button.variant');
    },
  },
  {
    id: 'detect-code-default-drift',
    claim: 'C3-detection',
    run: () => {
      replaceInFile(BTN_TSX, "variant = 'default',", "variant = 'orange',");
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'code', 'mismatch', 'Button.variant (default)');
    },
  },
  {
    id: 'detect-figma-missing-property',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        delete s.sets.find((x: any) => x.name === FIGMA_SET).properties[VARIANT_PROPERTY];
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma', 'behind', `Button.${VARIANT_PROPERTY}`);
    },
  },
  {
    id: 'detect-figma-extra-property',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        s.sets.find((x: any) => x.name === FIGMA_SET).properties['Elevated#1:1'] = {
          type: 'BOOLEAN',
          defaultValue: false,
          variantOptions: null,
        };
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      const f = expectFinding(readReport(), 'figma', 'ahead', 'Button.Elevated');
      if (!f.proposedPatch) throw new Error('No promotion patch proposed');
    },
  },
  {
    id: 'detect-figma-variant-options-drift',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        s.sets.find((x: any) => x.name === FIGMA_SET).properties[VARIANT_PROPERTY].variantOptions.push('Ghost');
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma', 'mismatch', `Button.${VARIANT_PROPERTY}`);
    },
  },
  {
    id: 'detect-token-alias-drift',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_TOKENS, (t) => {
        t.collections
          .find((c: any) => c.name === 'Primitives')
          .variables.find((v: any) => v.name === 'color/orange').values.Value = '#123456';
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      const f = expectFinding(
        readReport(),
        'figma-tokens',
        'mismatch',
        'Primitives/color/orange [Value]',
      );
      if ((f.proposedPatch as any)?.adoptFigmaValue !== '#123456')
        throw new Error('Adoption patch missing/incorrect');
    },
  },
  {
    id: 'detect-token-missing-variable',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_TOKENS, (t) => {
        const col = t.collections.find((c: any) => c.name === 'Primitives');
        col.variables = col.variables.filter((v: any) => v.name !== 'color/orange');
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma-tokens', 'behind', 'Primitives/color/orange');
    },
  },
  {
    id: 'detect-token-extra-variable',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_TOKENS, (t) => {
        t.collections
          .find((c: any) => c.name === 'Primitives')
          .variables.push({
            name: 'color/inexistant',
            type: 'COLOR',
            values: { Value: '#abcdef' },
          });
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma-tokens', 'ahead', 'Primitives/color/inexistant');
    },
  },
  {
    id: 'refuse-circular-dependency',
    claim: 'C2-refusal',
    run: () => {
      writeFileSync(
        path.join(SCRATCH, 'contracts', 'x.contract.json'),
        JSON.stringify(MINIMAL_CONTRACT('ds.x', 'X', 'ds.y')),
      );
      writeFileSync(
        path.join(SCRATCH, 'contracts', 'y.contract.json'),
        JSON.stringify(MINIMAL_CONTRACT('ds.y', 'Y', 'ds.x')),
      );
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted a circular composition');
      if (!r.out.includes('Circular')) throw new Error('Cycle not named in error');
    },
  },
  {
    id: 'refuse-unknown-component-ref',
    claim: 'C2-refusal',
    run: () => {
      // Self-contained: Piqueray ships no composed contract, so the case
      // writes the composition it is about (a ref to a contract that is not
      // in scope) into the scratch workspace.
      writeFileSync(
        path.join(SCRATCH, 'contracts', 'refhost.contract.json'),
        JSON.stringify(MINIMAL_CONTRACT('ds.refhost', 'RefHost', 'ds.ghost')),
      );
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted an unknown component ref');
      if (!r.out.includes('unknown contract')) throw new Error('Unknown ref not named');
    },
  },
  {
    // Adversarial refusal sweep (2026-07-06): these invalid states once
    // passed the generator SILENTLY. Each must now be refused BY NAME —
    // C2 is "fails loudly naming the violation", not "happens to break".
    id: 'refuse-contract-edge-cases',
    claim: 'C2-refusal',
    run: () => {
      const BADGE = CONTRACT; // the shipping contract — Piqueray's Button
      const pristine = readFileSync(path.join(SCRATCH, BADGE), 'utf8');
      const expectRefusal = (label: string, needle: string, mutate: (c: any) => void) => {
        editJson(BADGE, mutate);
        const r = generate();
        writeFileSync(path.join(SCRATCH, BADGE), pristine);
        if (r.status === 0) throw new Error(`${label}: ACCEPTED (must refuse)`);
        if (!r.out.includes(needle)) throw new Error(`${label}: refused but violation not named — wanted "${needle}" in:\n${r.out.slice(0, 600)}`);
      };
      expectRefusal('default-not-in-enum', 'is not one of its enum values', (c) => {
        c.props.find((p: any) => typeof p.type === 'object').default = 'nonexistent';
      });
      expectRefusal('duplicate-figma-property', 'two props bind the same design property', (c) => {
        const first = c.props.find((p: any) => typeof p.type === 'object');
        c.props.push({ name: 'zzz', type: { enum: ['a', 'b'] }, default: 'a',
          bindings: { figma: { kind: 'VARIANT', property: first.bindings.figma.property, values: { a: 'A', b: 'B' } }, code: { prop: 'zzz' } } });
      });
      expectRefusal('figma-values-map-missing-value', 'figma values map is missing enum value', (c) => {
        const p = c.props.find((x: any) => typeof x.type === 'object' && x.bindings.figma.values);
        delete p.bindings.figma.values[p.type.enum[0]];
      });
      expectRefusal('required-text-no-default', 'must declare a default', (c) => {
        c.props.push({ name: 'must', type: 'text', required: true,
          bindings: { figma: { kind: 'TEXT', property: 'Must' }, code: { prop: 'must' } } });
      });
      expectRefusal('malformed-token-ref', 'must be brace-wrapped', (c) => {
        c.anatomy.root.tokens['background-color'] = '{color.token.default.background';
      });
      // duplicate contract NAME across files → would clobber generated output
      const dupe = JSON.parse(pristine);
      dupe.id = 'ds.button-two';
      writeFileSync(path.join(SCRATCH, 'contracts', 'zz-dupe.contract.json'), JSON.stringify(dupe, null, 2));
      const r = generate();
      rmSync(path.join(SCRATCH, 'contracts', 'zz-dupe.contract.json'));
      if (r.status === 0 || !r.out.includes('duplicate contract name')) {
        throw new Error(`duplicate-contract-name: not refused by name:\n${r.out.slice(0, 400)}`);
      }
      // Red-team additions (2026-07-08):
      expectRefusal('duplicate-code-binding (git-merge artifact)', 'duplicate code binding', (c) => {
        const first = c.props.find((p: any) => typeof p.type === 'object');
        const clone = JSON.parse(JSON.stringify(first));
        clone.name = 'variantTwo';
        clone.bindings.figma.property = 'Variant Two';
        c.props.push(clone); // same bindings.code.prop as the original
      });
      expectRefusal('non-semver version', 'semver', (c) => { c.version = 'v2-final'; });
      expectRefusal('unknown field silently stripped (strict schema)', 'Unrecognized key', (c) => {
        c.behavior = { on: 'hover' };
      });
      // and a refused contract must FAIL FAST by name — never crash a
      // dependent contract with an unnamed TypeError (the bug this found)
      editJson(BADGE, (c) => { c.props.find((p: any) => typeof p.type === 'object').type.enum = []; });
      const r2 = generate();
      writeFileSync(path.join(SCRATCH, BADGE), pristine);
      if (r2.status === 0) throw new Error('empty-enum: ACCEPTED');
      if (r2.out.includes('TypeError')) throw new Error('empty-enum: crashed downstream instead of failing fast with the named refusal');
    },
  },
  {
    // Brownfield (roadmap Phase 2): both extraction adapters must read a
    // FOREIGN library — conventions this repo's generator never emits — into
    // schema-valid proposals with correct kinds, values, defaults, events.
    id: 'extract-foreign-library',
    claim: 'C5-extraction',
    run: () => {
      for (const cfg of ['extract/fixtures/foreign-react.config.json', 'extract/fixtures/foreign-wc.config.json']) {
        const r = run(TSX, ['extract/run.ts', 'code', cfg]);
        if (r.status !== 0) throw new Error(`Extraction failed for ${cfg}:\n${r.out}`);
      }
      const chip = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-react/contracts/chip.contract.json'), 'utf8'),
      );
      const tone = chip.props.find((p: any) => p.name === 'tone');
      if (tone?.type?.enum?.join('|') !== 'neutral|info|success|critical' || tone.default !== 'neutral') {
        throw new Error('Chip.tone: one-hop alias enum or destructure default not extracted');
      }
      if (chip.events?.[0]?.bindings?.code?.prop !== 'onRemove') {
        throw new Error('Chip: onRemove not proposed as a declared event');
      }
      const alert = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-react/contracts/alert.contract.json'), 'utf8'),
      );
      if (alert.props.find((p: any) => p.name === 'severity')?.default !== 'info') {
        throw new Error('Alert.severity: legacy defaultProps default not extracted');
      }
      const tag = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-react/contracts/tag.contract.json'), 'utf8'),
      );
      const intent = tag.props.find((p: any) => p.name === 'intent');
      if (intent?.type?.enum?.join('|') !== 'neutral|brand|danger' || intent.default !== 'neutral') {
        throw new Error('Tag.intent: cva variant axis or defaultVariants default not extracted');
      }
      if (tag.props.find((p: any) => p.name === 'interactive')?.type !== 'boolean') {
        throw new Error('Tag.interactive: inline intersection member not extracted');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-react/proposals.md'), 'utf8');
      if (!notes.includes('**Opaque**') || !notes.includes('NOT extractable')) {
        throw new Error('Unreadable component was silently dropped instead of reported');
      }
      const badge = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-wc/contracts/fancy-badge.contract.json'), 'utf8'),
      );
      if (badge.props.find((p: any) => p.name === 'appearance')?.type?.enum?.length !== 3) {
        throw new Error('FancyBadge.appearance: CEM text-union enum not extracted');
      }
      if (badge.events?.[0]?.bindings?.code?.prop !== 'onDismiss') {
        throw new Error('FancyBadge: CEM event fb-dismiss not mapped to onDismiss');
      }
    },
  },
  {
    // Roadmap Phase 2 exit criterion, first half: the diagnostic loop runs
    // green→red→green on two surfaces this repo did NOT generate — foreign-
    // convention React source + a design dump, refereed by extracted
    // proposals, with correct per-surface classifications.
    id: 'diagnose-foreign-green-red-green',
    claim: 'C5-extraction',
    run: () => {
      const CFG = 'extract/fixtures/foreign-react.config.json';
      const diagnose = () => run(TSX, ['parity/diagnose.ts', CFG]);
      let r = run(TSX, ['extract/run.ts', 'code', CFG]);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      if (diagnose().status !== 0) throw new Error('Baseline not green on foreign surfaces');
      // red on the design surface
      editJson('extract/fixtures/foreign-design.json', (d) => {
        d.components[0].variantProps.Tone = ['Neutral', 'Info', 'Success'];
      });
      r = diagnose();
      if (r.status === 0 || !r.out.includes('[design MISMATCH] Chip.Tone')) {
        throw new Error(`Design drift not caught/classified:\n${r.out}`);
      }
      editJson('extract/fixtures/foreign-design.json', (d) => {
        d.components[0].variantProps.Tone = ['Neutral', 'Info', 'Success', 'Critical'];
      });
      // red on the code surface
      replaceInFile(
        'extract/fixtures/foreign-react/Chip.tsx',
        "size?: 'compact' | 'regular';",
        "size?: 'compact' | 'regular' | 'spacious';",
      );
      r = diagnose();
      if (r.status === 0 || !r.out.includes('[code MISMATCH] Chip.size')) {
        throw new Error(`Code drift not caught/classified:\n${r.out}`);
      }
      replaceInFile(
        'extract/fixtures/foreign-react/Chip.tsx',
        "size?: 'compact' | 'regular' | 'spacious';",
        "size?: 'compact' | 'regular';",
      );
      if (diagnose().status !== 0) throw new Error('Did not return to green after revert');
    },
  },
  {
    // Enterprise gauntlet fix #1 (SIBLING-TYPE-FILE + CAST-TRANSPARENCY
    // rules): a Fluent-2-shaped component — props interface in a sibling
    // `X.types.ts`, export cast `as ForwardRefComponent<XProps>` — was
    // invisible (measured: Fluent census 0/23). It must extract with its
    // enum axes, the one-hop alias resolving THROUGH the merged table, and
    // the unreadable generic intersection member receipted by name.
    id: 'fluent-sibling-types-merge',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-sibling.config.json']);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      const widget = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-sibling/contracts/widget.contract.json'), 'utf8'),
      );
      const appearance = widget.props.find((p: any) => p.name === 'appearance');
      if (appearance?.type?.enum?.join('|') !== 'primary|outline|subtle') {
        throw new Error('Widget.appearance: sibling-types enum not extracted');
      }
      const size = widget.props.find((p: any) => p.name === 'size');
      if (size?.type?.enum?.join('|') !== 'small|medium|large') {
        throw new Error('Widget.size: one-hop alias behind the SIBLING table not resolved');
      }
      if (widget.props.find((p: any) => p.name === 'disabled')?.type !== 'boolean') {
        throw new Error('Widget.disabled: boolean not extracted through the cast');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-sibling/proposals.md'), 'utf8');
      if (!notes.includes('ComponentProps<WidgetSlots>') || !notes.includes('NOT carried')) {
        throw new Error('Unreadable generic intersection member not receipted by name');
      }
    },
  },
  {
    // Enterprise gauntlet fix #2 (silent-loss class B): `as`-cast exports.
    // The CAST-ALIAS rule extracts the public name (`const Pill = PillBase
    // as PillComponent`) with the base's props; an as-cast component whose
    // props type is imported lands as a NAMED skip — nothing silent.
    id: 'as-expression-named',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-sibling.config.json']);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      for (const id of ['pill', 'pill-base']) {
        const c = JSON.parse(
          readFileSync(path.join(SCRATCH, `extract/fixtures/.out-sibling/contracts/${id}.contract.json`), 'utf8'),
        );
        const tone = c.props.find((p: any) => p.name === 'tone');
        if (tone?.type?.enum?.join('|') !== 'neutral|bold|critical' || tone.default !== 'neutral') {
          throw new Error(`${id}: cast-alias did not carry the base component's props`);
        }
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-sibling/proposals.md'), 'utf8');
      if (!notes.includes('**Opal**') || !notes.includes('OpalProps')) {
        throw new Error('as-cast component with imported props type not NAMED-skipped (silent loss)');
      }
    },
  },
  {
    // Enterprise gauntlet fix #3 (silent-loss class C): intersections of
    // named refs. Same-file refs RESOLVE (`type BannerProps = A & B` carries
    // A+B members instead of a hollow 0-prop "resolved" API); imported refs
    // become a NAMED skip listing them; an extends-only interface extracts
    // as genuinely zero-own-prop WITH the hollow receipt naming heritage.
    id: 'intersection-named',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-sibling.config.json']);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      const banner = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-sibling/contracts/banner.contract.json'), 'utf8'),
      );
      const tone = banner.props.find((p: any) => p.name === 'tone');
      if (tone?.type?.enum?.join('|') !== 'info|warning|critical' || tone.default !== 'info') {
        throw new Error('Banner.tone: intersection-of-named-refs member not resolved');
      }
      if (banner.props.find((p: any) => p.name === 'dismissible')?.type !== 'boolean') {
        throw new Error('Banner.dismissible: second intersection member not resolved');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-sibling/proposals.md'), 'utf8');
      if (!notes.includes('**Ghost**') || !notes.includes('[GhostA, GhostB]')) {
        throw new Error('Imported-refs intersection not NAMED-skipped with the refs listed');
      }
      if (!notes.includes('NO OWN members (extends React.HTMLAttributes<HTMLDivElement>')) {
        throw new Error('Extends-only interface missing the hollow receipt naming its heritage');
      }
      const plainBox = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-sibling/contracts/plain-box.contract.json'), 'utf8'),
      );
      if (plainBox.props.length !== 0) throw new Error('PlainBox: extends-only interface should carry zero own props');
    },
  },
  {
    // ASTRYX ROUND fix #1 (KEYOF-ENUM RULE — the 57%-median cause on the
    // Astryx census, direct analog of Carbon's `(typeof X)[number]`): a
    // prop typed `keyof X` — behind a one-hop alias, keying an in-file
    // interface (`type ButtonVariant = keyof ButtonVariantMap`), a plain
    // const table, or a `create({…})`-style factory call — must resolve to
    // its concrete value set (confidence 'inferred', assumption receipted),
    // and an UNRESOLVABLE keyof target must land as a NAMED refusal.
    id: 'keyof-enum-resolution',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-keyof.config.json']);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      const toggle = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-keyof/contracts/toggle.contract.json'), 'utf8'),
      );
      const tone = toggle.props.find((p: any) => p.name === 'tone');
      if (tone?.type?.enum?.join('|') !== 'neutral|accent|danger' || tone.default !== 'neutral') {
        throw new Error('Toggle.tone: keyof-interface enum (or its destructure default) not extracted');
      }
      if (toggle.props.find((p: any) => p.name === 'pace')?.type?.enum?.join('|') !== 'slow|fast') {
        throw new Error('Toggle.pace: keyof typeof factory-call object not resolved');
      }
      if (toggle.props.find((p: any) => p.name === 'density')?.type?.enum?.join('|') !== 'compact|cozy') {
        throw new Error('Toggle.density: keyof typeof as-const object not resolved');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-keyof/proposals.md'), 'utf8');
      if (!notes.includes('key-preserving factory ASSUMED')) {
        throw new Error('Factory-call key read not receipted as an assumption');
      }
      if (!notes.includes('`flavor`: keyof value set NOT carried') || !notes.includes('importedFlavors')) {
        throw new Error('Unresolvable keyof target not refused BY NAME');
      }
      // HERITAGE RECEIPT (found by the Astryx .doc.mjs referee): an
      // interface WITH own members must still name its unread parents.
      if (!notes.includes('extends BasePropsLike<HTMLButtonElement>') || !notes.includes('NOT carried')) {
        throw new Error('Heritage of an interface WITH own members not receipted');
      }
    },
  },
  {
    // ASTRYX ROUND fix #2 (UNION-OF-REFS RULE — recovers 7 of Astryx's 21
    // named skips incl. Slider; the mutually-exclusive-API sibling of
    // gauntlet fix #3): same-file `A | B` props types merge the members of
    // every readable branch (heritage chased through the same-file chain),
    // force branch-specific members optional, receipt the merge — and a
    // union with an IMPORTED branch carries the readable branch while
    // receipting the dark one by name.
    id: 'union-of-refs-composition',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-keyof.config.json']);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      const range = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-keyof/contracts/range.contract.json'), 'utf8'),
      );
      if (range.props.find((p: any) => p.name === 'tone')?.type?.enum?.join('|') !== 'quiet|loud') {
        throw new Error('Range.tone: shared-base member not carried through union branch heritage');
      }
      if (range.props.find((p: any) => p.name === 'min')?.type !== 'number') {
        throw new Error('Range.min: base member missing from the merged union surface');
      }
      const legend = range.props.find((p: any) => p.name === 'legend');
      if (!legend || legend.required === true) {
        throw new Error('Range.legend: branch-specific required member must merge as OPTIONAL');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-keyof/proposals.md'), 'utf8');
      if (!notes.includes('UNION of alternatives [RangeSingleProps | RangeDualProps]')) {
        throw new Error('Union merge not receipted');
      }
      const fork = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-keyof/contracts/fork.contract.json'), 'utf8'),
      );
      if (fork.props.find((p: any) => p.name === 'prong')?.type?.enum?.join('|') !== 'left|right') {
        throw new Error('Fork.prong: readable union branch not carried alongside a dark branch');
      }
      if (!notes.includes('[ImportedForkProps]') || !notes.includes('NOT carried')) {
        throw new Error('Dark union branch not receipted BY NAME');
      }
    },
  },
  {
    // Enterprise gauntlet fix #4: published CEM manifests ship events
    // WITHOUT a name (SWC ships 7) — extract/adapters/cem.ts:82 used to
    // crash with a TypeError. A nameless event must become a NAMED per-event
    // skip while the component and its named events keep extracting.
    id: 'cem-nameless-event-skip',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-wc-nameless.config.json']);
      if (r.status !== 0) throw new Error(`Nameless-event manifest crashed extraction:\n${r.out}`);
      const c = JSON.parse(
        readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-wc-nameless/contracts/glass-dialog.contract.json'), 'utf8'),
      );
      if (c.props.find((p: any) => p.name === 'size')?.type?.enum?.length !== 3) {
        throw new Error('GlassDialog.size: attributes no longer extracted alongside the bad event');
      }
      if (c.events?.[0]?.bindings?.code?.prop !== 'onClose') {
        throw new Error('GlassDialog: the NAMED event gd-close was not carried');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-wc-nameless/proposals.md'), 'utf8');
      if (!notes.includes('GlassDialog event[0]') || !notes.includes('CEM event has no "name"')) {
        throw new Error('Nameless event not skipped BY NAME');
      }
    },
  },
  {
    id: 'native-button-type',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/native-button-type-check.ts']);
      if (r.status !== 0 || !r.out.includes('native button roots are type=button')) {
        throw new Error(`native button type check failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'code-only-scalar-prop',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/code-only-scalar-prop-check.ts']);
      if (r.status !== 0 || !r.out.includes('scalar props can be explicitly code-only')) {
        throw new Error(`code-only scalar prop check failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'component-visiblewhen-emission',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/component-visiblewhen-emission-check.ts']);
      if (r.status !== 0 || !r.out.includes('visibleWhen gates composed children')) {
        throw new Error(`component visibleWhen check failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'component-children-prop-emission',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/component-children-prop-emission-check.ts']);
      if (r.status !== 0 || !r.out.includes('composed children prop mappings emit one JSX child')) {
        throw new Error(`component children prop emission check failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'single-value-enum-code-extraction',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/single-value-enum-code-extraction-check.ts']);
      if (r.status !== 0 || !r.out.includes('one-value enum')) {
        throw new Error(`single-value enum code extraction check failed:\n${r.out}`);
      }
    },
  },
  {
    // Independent harness regression: text ink can rasterize to different
    // alpha bboxes without moving the component's shared geometric frame.
    id: 'visual-root-alignment',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-root-alignment-check.ts']);
      if (r.status !== 0 || !r.out.includes('root geometry anchors image parity')) {
        throw new Error(`visual root alignment check failed:\n${r.out}`);
      }
    },
  },
  {
    // Independent gate regression: a DOM text mask may erase every changed
    // pixel while leaving an identical sliver in the denominator. The mask
    // remains useful diagnosis, but can never turn a raw failure green.
    id: 'visual-mask-cannot-false-green',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-mask-false-green-check.ts']);
      if (r.status !== 0 || !r.out.includes('gate remains raw')) {
        throw new Error(`visual mask false-green check failed:\n${r.out}`);
      }
    },
  },
  {
    // Independent harness regression: transparent white ink is invisible
    // after the default light flattening. A subject-declared dark inspection
    // surface must expose positional drift on both PNGs without styling code.
    id: 'visual-transparent-ink-surface',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/visual-transparent-ink-surface-check.ts']);
      if (r.status !== 0 || !r.out.includes('dark inspection surface exposes')) {
        throw new Error(`visual transparent-ink surface check failed:\n${r.out}`);
      }
    },
  },
  {
    // Independent emitter regression: Figma strokes are painted inside their
    // frame. A bottom-only root stroke therefore must not use a CSS border
    // that adds a pixel to an auto-sized component.
    id: 'bottom-inset-border',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/bottom-inset-border-check.ts']);
      if (r.status !== 0 || !r.out.includes('bottom-only Figma stroke is painted inset')) {
        throw new Error(`bottom inset border check failed:\n${r.out}`);
      }
    },
  },
  {
    // Independent emitter regression: a variant-sized icon must resize the
    // painted SVG as well as its wrapper on every generated surface.
    id: 'icon-variant-svg-size',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/icon-variant-svg-size-check.ts']);
      if (r.status !== 0 || !r.out.includes('variant icon size reaches the painted SVG')) {
        throw new Error(`variant icon size check failed:\n${r.out}`);
      }
    },
  },
  {
    // Independent engine gap exposed by Avantage: one native Figma TEXT
    // property may carry mixed strong ranges. Code must retain those ranges
    // structurally while the canvas property receives the same flat string.
    id: 'structured-rich-text',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/structured-rich-text-check.ts']);
      if (r.status !== 0 || !r.out.includes('structured rich-text stays typed and marked')) {
        throw new Error(`structured rich-text check failed:\n${r.out}`);
      }
    },
  },
  {
    // Parity must retain the typed code default while comparing the same
    // rich-text value as a flat native Figma TEXT property.
    id: 'rich-text-parity-projection',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/rich-text-parity-projection-check.ts']);
      if (r.status !== 0 || !r.out.includes('rich-text parity preserves code marks')) {
        throw new Error(`rich-text parity projection check failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'rich-text-mark-styles',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/rich-text-mark-style-check.ts']);
      if (r.status !== 0 || !r.out.includes('rich-text strong mark styles are governed')) {
        throw new Error(`rich-text mark style check failed:\n${r.out}`);
      }
    },
  },
  {
    // Enterprise gauntlet fix #6: none of Carbon/Fluent/Spectrum/Polaris
    // publishes DTCG, but every published shape is one MECHANICAL $value
    // wrap away — core/wrap-plain-tokens.ts. Fixture shapes mirror all four;
    // unknowns are skipped by name; already-DTCG input is refused (null).
    id: 'plain-token-wrap',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['evals/fixtures/plain-token-wrap-check.ts']);
      if (r.status !== 0 || !r.out.includes('all shapes load, all refusals named')) {
        throw new Error(`plain-token-wrap check failed:\n${r.out}`);
      }
    },
  },
  {
    // ASTRYX ROUND, token side: StyleX systems publish tokens as
    // `stylex.defineVars({…})` TypeScript source with dual-mode values
    // ENCODED IN THE VALUE as CSS `light-dark(a, b)` — a third mode
    // architecture (vs Carbon's parallel themes / Nord's parallel files).
    // core/stylex-tokens.ts must read the tables syntactically, split
    // light-dark() paren-aware into the v1.6 modes shape, and skip
    // everything unreadable BY NAME.
    id: 'stylex-token-wrap',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['evals/fixtures/stylex-tokens-check.ts']);
      if (r.status !== 0 || !r.out.includes('stylex-token-wrap ok:')) {
        throw new Error(`stylex-token-wrap check failed:\n${r.out}`);
      }
    },
  },
  {
    // HEAL ROUND, live-gauntlet class ① (fill-matrix-depth-drop): a bound
    // fill that is a function of TWO OR THREE variant axes with mixed-depth
    // token paths (CBDS Badge f(type,style), Chip f(type,style,state)) used
    // to DROP the root paint entirely — Badge diffed 96.85% masked, Chip
    // 98.58%, the kit's most-drawn primitives rendering as bare text. The
    // fix routes the named drift into the mint pass (captured-value literal
    // fidelity, per-variant leaves, axis pair/triple substituted root refs);
    // the eval replays the committed fixture slice through propose→referee→
    // all four emitters and pins the never-silent-drop invariant.
    id: 'fill-matrix-depth-mint',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['evals/fixtures/fill-matrix-mint-check.ts']);
      if (r.status !== 0 || !r.out.includes('fill-matrix-mint ok:')) {
        throw new Error(`fill-matrix-mint check failed:\n${r.out}`);
      }
    },
  },
  {
    // HEAL ROUND, live-gauntlet class ④ (linked-child-html-escaped-as-text):
    // CBDS Text Area showed literal '<div class="input-label">' INSIDE the
    // field — corrected diagnosis: the parent's inferred root element is
    // <textarea> (raw-text content model), so the BROWSER renders every
    // child tag as text; void roots hoist children out (input family
    // 48–66%), <select> drops them (Dropdown = caret only). emit-html now
    // projects such boxes to a neutral <div> with a NAMED comment. Pins the
    // projection AND the XSS invariants (child markup stays structure, leaf
    // text stays escaped, part-less native roots untouched).
    id: 'raw-text-root-projection',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/raw-text-root-projection-check.ts']);
      if (r.status !== 0 || !r.out.includes('raw-text-root-projection ok:')) {
        throw new Error(`raw-text-root-projection check failed:\n${r.out}`);
      }
    },
  },
  {
    // HEAL ROUND, live-gauntlet harness class ⑦ (underscore pickSet): a
    // name-prefix convention is not a type test — visual-parity compose now
    // excludes the dump meta channels BY NAME and addresses the owner's 30
    // underscore-NAMED sets ("_Input label", "_Tab-item", …) exactly like
    // the playground receive path; the live-gauntlet clone is deleted.
    id: 'underscore-set-compose',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/underscore-set-compose-check.ts']);
      if (r.status !== 0 || !r.out.includes('underscore-set-compose ok:')) {
        throw new Error(`underscore-set-compose check failed:\n${r.out}`);
      }
    },
  },
  {
    // HEAL ROUND, live-gauntlet class ③ (session-id-collision-false-cycle):
    // "RadioButton" the COMPONENT vs "Radio button" the set — both sanitize
    // to ds.radio-button; the session's newest-wins registry rebound the
    // icon's stub ref onto the later-imported parent and the referee
    // reported a cycle that is not drawn (all 12 variants refused). Fix:
    // proposal-time id claiming applies the stubIdFor contradicting-key
    // suffix discipline against SESSION-claimed ids (keys first — v1.5/v1.6
    // identity; setless stubs now carry the component key). Pins the suffix
    // + named note + zero-violation referee + same-key heal + unchanged
    // batch scope, over the committed trio fixture.
    id: 'session-id-collision-suffix',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/session-id-collision-check.ts']);
      if (r.status !== 0 || !r.out.includes('session-id-collision ok:')) {
        throw new Error(`session-id-collision check failed:\n${r.out}`);
      }
    },
  },
  {
    // HEAL ROUND, live-gauntlet class ⑤ (linked-icon-wrapper-collapses):
    // linking must never render worse than stubbing. The CBDS Icon wrapper
    // (slot-only root, drawn FIXED box: height + max-width bindings)
    // rendered ZERO-SIZE when its slot was empty — min-width: fit-content
    // is 0 without content — and Icon Button collapsed to a 16×48 pill
    // (54.7–63.4% masked, 180 rows). Every root max-width now mirrors onto
    // min-width for such wrappers (the stub discipline's observed-geometry
    // floor); fluid slot containers (no height binding — List/Toast/
    // Toolbar) keep fit-content, so repo output is untouched.
    id: 'slot-wrapper-floor',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/slot-wrapper-floor-check.ts']);
      if (r.status !== 0 || !r.out.includes('slot-wrapper-floor ok:')) {
        throw new Error(`slot-wrapper-floor check failed:\n${r.out}`);
      }
    },
  },
  {
    // Red-team (2026-07-08): run-2-vs-run-1 determinism is true of broken
    // generators too. The golden manifest pins generator OUTPUT — mutants
    // that mirror alignment or drop the focus ring now fail here.
    id: 'golden-generated-output',
    claim: 'C1-determinism',
    run: () => {
      if (buildTokens().status !== 0 || generate().status !== 0) throw new Error('Build failed');
      if (run(TSX, ['scripts/generate-figma.ts']).status !== 0) throw new Error('figma:plan failed');
      const golden: Record<string, string> = JSON.parse(
        readFileSync(path.join(SCRATCH, 'evals', 'golden.json'), 'utf8'),
      );
      const bad: string[] = [];
      for (const [rel, hash] of Object.entries(golden)) {
        let actual = '';
        try {
          actual = createHash('sha256').update(readFileSync(path.join(SCRATCH, rel))).digest('hex');
        } catch { bad.push(`${rel}: MISSING`); continue; }
        if (actual !== hash) bad.push(rel);
      }
      if (bad.length > 0) {
        throw new Error(`Generated output diverges from golden manifest (${bad.length} file[s]): ${bad.slice(0, 5).join(', ')} — if intentional, npm run golden:update in a reviewed change`);
      }
    },
  },
  {
    id: 'detect-snapshot-provenance-mismatch',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s2) => { s2.fileKey = 'WRONG_FILE_KEY'; });
      const r = parity();
      if (r.status !== 1) throw new Error('Foreign-file snapshot passed parity');
      const f = readReport().find((x) => x.subject === 'snapshot-provenance');
      if (!f || f.surface !== 'figma' || f.classification !== 'mismatch')
        throw new Error(`Expected [figma mismatch] snapshot-provenance; got: ${JSON.stringify(f)}`);
    },
  },
  {
    id: 'detect-stale-snapshot',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s2) => { s2.extractedAt = Date.now() - 15 * 86_400_000; });
      const r = parity();
      if (r.status !== 1) throw new Error('15-day-old snapshot passed the 14-day staleness gate');
      if (!readReport().some((x) => x.subject === 'snapshot-stale'))
        throw new Error('Expected snapshot-stale finding');
    },
  },
  {
    // CODE→CONTRACT round-trip identity: generated components are ground truth
    // for the css-module anatomy adapter — re-extracting every shipping
    // component must referee ZERO MISMATCH, and the receipt must be able to go
    // red. (Anchor: the Piqueray Button's own root `color` binding — the demo
    // Badge/Switch/Card trio went with the reconversion.)
    id: 'extract-code-roundtrip-identity',
    claim: 'C5-extraction',
    run: () => {
      let r = run(TSX, ['extract/roundtrip-code.ts']);
      if (r.status !== 0 || !r.out.includes('0 mismatched')) throw new Error(`Round trip not clean:\n${r.out}`);
      // First occurrence is the root's `color` declaration.
      replaceInFile('src/components/Button/Button.module.css', 'var(--color-blanc)', 'var(--color-noir-bleute)');
      r = run(TSX, ['extract/roundtrip-code.ts']);
      if (r.status === 0 || !r.out.includes('[Button MISMATCH] anatomy.root')) {
        throw new Error(`Token drift not caught by the round-trip receipt:\n${r.out}`);
      }
      replaceInFile('src/components/Button/Button.module.css', 'var(--color-noir-bleute)', 'var(--color-blanc)');
      if (run(TSX, ['extract/roundtrip-code.ts']).status !== 0) throw new Error('Did not return to zero-mismatch after revert');
    },
  },
  {
    // Raw CSS values are REPORTED with nearest-token candidates, never invented.
    id: 'extract-raw-values-never-invented',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/run.ts', 'code', 'extract/fixtures/foreign-css.config.json']);
      if (r.status !== 0) throw new Error(`Extraction failed:\n${r.out}`);
      const raw = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-css/contracts/callout.contract.json'), 'utf8');
      if (/#f4f6fa|#374151|\b(6|8|12|14)px\b/i.test(raw)) throw new Error('A raw CSS value leaked into the proposed contract');
      const c = JSON.parse(raw);
      if (c.anatomy.root.parts?.heading?.content?.prop !== 'heading' || c.anatomy.root.parts?.body?.slot?.name !== 'children') {
        throw new Error('Foreign structure (content binding + slot) not extracted');
      }
      const notes = readFileSync(path.join(SCRATCH, 'extract/fixtures/.out-css/proposals.md'), 'utf8');
      if (!notes.includes('{ background-color: #f4f6fa }') || !notes.includes('{color.bleu-clair}')) throw new Error('Raw value not reported with nearest-token candidates');
      if (!notes.includes('var(--text-muted) which resolves to NO token')) throw new Error('Unresolvable css var not refused by name');
    },
  },
  {
    // Unbound fills are preserved through a provisional imported.* mint. They
    // must never be silently aliased to a visually equal governed token:
    // human review decides that semantic promotion later.
    id: 'design-propose-unbound-fill-provisional-mint',
    claim: 'C5-extraction',
    run: () => {
      // A hex equal to a real Piqueray primitive ({color.orange} = #f98a0b)
      // that the dump does NOT bind as a variable: the fill is unbound, so it
      // must be preserved under imported.* — never silently adopted as orange.
      editJson('extract/figma/fixtures/main-file-dumps.json', (d) => {
        for (const v of d.Badge.variants) v.fill = { hex: 'f98a0b' };
      });
      const r = run(TSX, ['extract/figma/propose.ts', 'extract/figma/fixtures/main-file-dumps.json', '--out', 'extract/out/figma']);
      if (r.status !== 0) throw new Error(`Proposal failed on an unbound fill:\n${r.out}`);
      const proposed = JSON.parse(readFileSync(path.join(SCRATCH, 'extract', 'out', 'figma', 'badge.contract.proposed.json'), 'utf8'));
      const bg = proposed.anatomy.root.tokens?.['background-color'];
      if (bg !== '{imported.badge.root.background-color}') {
        throw new Error(`Unbound fill was not preserved under its deterministic provisional mint: ${bg}`);
      }
      const report = readFileSync(path.join(SCRATCH, 'extract', 'out', 'figma', 'figma-proposals.md'), 'utf8');
      if (!report.includes('MINTED {imported.badge.root.background-color} = #f98a0b')) {
        throw new Error('Provisional fill mint not named in the report');
      }
      if (bg === '{color.orange}') throw new Error('Unbound fill was silently promoted to a governed semantic token');
    },
  },
  {
    // The engine-is-a-library claim: the new emitters' schema-driven invariants
    // hold, and the receipt can go red — a broken literal resolution must fail.
    id: 'emitter-invariants-hold-and-fail',
    claim: 'C1-determinism',
    run: () => {
      let r = run(TSX, ['core/emitters-check.ts']);
      if (r.status !== 0 || !r.out.includes('all emitter invariants hold'))
        throw new Error(`Emitter invariants failed:\n${r.out}`);
      replaceInFile('core/emit-react-inline.ts',
        "return typeof v === 'number' ? v : String(v);",
        "return `var(--${tokenPath.split('.').join('-')})`;");
      r = run(TSX, ['core/emitters-check.ts']);
      if (r.status === 0 || !r.out.includes('NO var(--'))
        throw new Error('Inline emitter leaking custom properties passed the receipt');
    },
  },
  {
    // The public-playground claim: the core barrel bundles for platform=browser
    // and emits with zero node globals — and a node:* import sneaking into the
    // core module graph must fail the receipt by name.
    id: 'core-browser-importable',
    claim: 'C1-determinism',
    run: () => {
      let r = run(process.execPath, ['scripts/core-browser-check.mjs']);
      if (r.status !== 0 || !r.out.includes('no node globals'))
        throw new Error(`Browser check failed on a clean tree:\n${r.out}`);
      replaceInFile('core/tokens.ts',
        'export function collectTokenPaths',
        "import { readFileSync } from 'node:fs';\nvoid readFileSync;\nexport function collectTokenPaths");
      r = run(process.execPath, ['scripts/core-browser-check.mjs']);
      if (r.status === 0) throw new Error('A node:fs import inside the core passed the browser bundle check');
    },
  },
  {
    // Field case (Eventz DS Button): variants solely wrapping an INSTANCE of a
    // shared base component name-matching the set must flatten — no self
    // component ref, captured componentProperties promoted with exact Figma
    // spellings — and pass the generator on flattened AND named-skip paths.
    id: 'design-base-instance-flattening-no-self-reference',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/base-instance-check.ts']);
      if (r.status !== 0) throw new Error(`base-instance receipt failed:\n${r.out}`);
      if (!r.out.includes('all base-instance invariants hold'))
        throw new Error('base-instance receipt did not report green');
      if (!r.out.includes('✔ no component ref anywhere in the anatomy'))
        throw new Error('self-reference check missing from the receipt output');
    },
  },
  {
    // Hand-edited contracts can still contain a self-composition the proposer
    // never emits — the generator must refuse the cycle BY NAME (direct and
    // transitive), never crash with 'Maximum call stack size exceeded'.
    id: 'generator-refuses-component-ref-cycles',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['extract/figma/base-instance-check.ts']);
      if (r.status !== 0) throw new Error(`base-instance receipt failed:\n${r.out}`);
      if (!r.out.includes('✔ emitReact REFUSES the direct self-ref by name'))
        throw new Error('direct-cycle refusal check missing/failed');
      if (!r.out.includes('✔ transitive cycle refused with the chain spelled out'))
        throw new Error('transitive-cycle refusal check missing/failed');
    },
  },
  {
    // Owner P0 (CBDS Button-Brand Primary): semantics.element is inferred
    // DETERMINISTICALLY inside proposeFromDump (name/axis table, zero AI) —
    // button from the set name, "a" from "link", no match stays div with the
    // hedge note. "This is a freaking button" must never render as a div.
    id: 'design-semantics-element-inference',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS receipt failed:\n${r.out}`);
      if (!r.out.includes('✔ element "button" inferred (deterministic, inside proposeFromDump) and NOTED'))
        throw new Error('button inference check missing/failed');
      if (!r.out.includes('✔ name "Nav Link" → element "a", with a named inference note'))
        throw new Error('link inference check missing/failed');
      if (!r.out.includes('✔ no table match ("Chip") → element stays "div" with the existing hedge note'))
        throw new Error('no-match hedge check missing/failed');
      if (!r.out.includes('✔ emitReact: root renders <button (not a div)'))
        throw new Error('emitted <button> check missing/failed');
    },
  },
  {
    // Owner P0: a drawn `state` enum axis (default|hover|focus|pressed|
    // disabled) is the platform's interaction states, not API. Fixture replay
    // of the REAL imported set: the axis never becomes a prop; hover/pressed/
    // focus land as real state overrides; disabled is a BOOLEAN prop;
    // figmaStatePreviews round-trips the axis to the canvas; and the emitted
    // padding/font-size per SIZE variant EQUAL the dump's values exactly —
    // a wrong-but-plausible constant is the worst outcome and is refused.
    id: 'design-state-axis-promotion-cbds-replay',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS receipt failed:\n${r.out}`);
      for (const line of [
        '✔ NO `state` prop ships in the API',
        '✔ contract states [hover, active, focus-visible, disabled] declared',
        '✔ `disabled` is a real BOOLEAN prop (default false) — never an enum value shipped to code',
        '✔ figmaStatePreviews: true (the canvas round-trips the states as a State preview axis)',
        '✔ size=large: padding EXACT — emitted padding-inline resolves to 16px/16px, padding-block to 8px/8px (dump values)',
        '✔ size=small: padding EXACT — emitted padding-inline resolves to 12px/12px, padding-block to 8px/8px (dump values)',
        '✔ size=large: font-size EXACT — emitted value resolves to 16px (dump value)',
        '✔ size=small: font-size EXACT — emitted value resolves to 14px (dump value)',
        '✔ per-size values genuinely DIFFER in the emitted output (small ≠ large padding and font-size — no first-variant constant)',
        '✔ canvas script constructs the State preview axis (State=Hover / State=Active / State=Focus Visible / State=Disabled)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner P0: a proposal whose nested instance has no contract in scope
    // ships a child STUB — registering it makes the emitters run; NOT
    // registering it reproduces the owner's exact refusal, BY NAME. Pinned at
    // the engine level (the playground registers result.childStubs into its
    // contracts map via engine/stub-contracts.ts).
    id: 'design-child-stubs-prevent-scope-refusals',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS receipt failed:\n${r.out}`);
      if (!r.out.includes('✔ ds.icon child STUB auto-proposed alongside (parses against the contract schema)'))
        throw new Error('child-stub proposal check missing/failed');
      if (!r.out.includes("✔ WITHOUT the stub registered, emitReact refuses BY NAME (\"ds.icon\" … no contract in scope) — the owner's refusal, pinned"))
        throw new Error('unregistered-stub refusal check missing/failed');
      if (!r.out.includes('✔ emitReact: props extend ButtonHTMLAttributes<HTMLButtonElement>'))
        throw new Error('registered-stub emit check missing/failed');
    },
  },
  {
    // CROSS-IMPORT MINTED-TOKEN SCOPE (owner field case, two-import session):
    // import Button-Brand Primary (typography mints imported.*), then import
    // Dialog — session linking links the action button, and the CANVAS used
    // to refuse 'Cannot resolve token "imported.button-brand-primary.button.
    // font-size.large"' (the composite batch carried earlier minted layers
    // as CSS text only; the engine resolves literals through the token TREE).
    // The receipt replays the exact session: control refusal BY NAME, then
    // linkedImportScope compiles every surface with zero refusals and the
    // labeled cross-layer receipt line.
    id: 'cross-import-token-scope',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cross-import-check.ts']);
      if (r.status !== 0) throw new Error(`cross-import receipt failed:\n${r.out}`);
      for (const line of [
        "✔ WITHOUT the scope, compiling the linked button refuses with the owner's exact message",
        '✔ the CANVAS compiles: dialog 4 variants',
        '✔ the LINKED button compiles too: 3 size variants',
        "✔ the cross-layer receipt line is present and labeled: 'resolving through Button-Brand Primary's imported tokens — N'",
        '✔ referee (generateCss over the scoped inventory): zero violations (got 0)',
        '✔ react (css modules) emits with ZERO refusals',
        '✔ html (preview surface) emits with ZERO refusals',
        '✔ react-inline (literal resolution through the scoped tree) emits with ZERO refusals',
        '✔ figma script (engine over the scoped tree) emits with ZERO refusals',
        "✔ the figma script's minted preamble upserts the LINKED button's minted variables too",
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // PART-LEVEL STATE OVERRIDES (P18 second half, v13 — B7 retired; owner
    // hit it twice): his kit draws the disabled button LABEL at #556275
    // ({text.disabled}) on the #dfe3eb fill; the diff used to be the B7
    // named note and the preview drew the default #fcfeff — near-invisible.
    // Part.states now carries it (color-kind channels, non-ref parts,
    // refusal-ruled), the proposer PROPOSES depth-1 diffs, and every
    // surface renders it — including a refusal case per rule.
    id: 'part-level-state-overrides',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/part-state-check.ts']);
      if (r.status !== 0) throw new Error(`part-state receipt failed:\n${r.out}`);
      for (const line of [
        '✔ the label part carries states.disabled.color = {text.disabled} (his real bound variable)',
        '✔ the blanket B7 receipt is GONE from the notes (retired where the channel carries)',
        '✔ unknown state name refuses BY NAME ("sparkle" is not a STATE_SELECTORS state)',
        '✔ an UNDECLARED state refuses (states.hover on the part with `states: ["disabled"]` on the contract)',
        '✔ a non-color channel refuses BY NAME (font-size is not a part-state channel)',
        '✔ a component-ref part refuses (the child contract owns its styling)',
        '✔ css-modules: .root:disabled .Button { color: var(--text-disabled) } (descendant rule under the root state selector)',
        '✔ emit-html: .button-brand-primary:disabled .button-brand-primary__Button { color: var(--text-disabled) }',
        '✔ EVERY State=Disabled cell draws the label bound to text/disabled (the gray label) on the bg/disabled fill',
        '✔ the base variants keep the default label fill (text/inverse-primary — overrides never leak out of the state cells)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // BROWSER PROBE — the owner's exact complaint, pixel-truth: toggle
    // disabled in the preview and the label must COMPUTE #556275 on the
    // #dfe3eb fill (his captured {text.disabled} / {bg.disabled} values),
    // via the same emitHtml + captured/minted stylesheet pipeline the
    // playground preview assembles. Real Chromium, getComputedStyle.
    id: 'part-state-disabled-label-browser-probe',
    claim: 'C1-determinism',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import path from 'node:path';
        import { chromium } from 'playwright-core';
        import { chromiumExecutable } from './extract/figma/visual-parity/render.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { loadTokenCorpus } from './extract/figma/tokens.ts';
        import { loadContracts } from './extract/figma/propose.ts';
        import { proposeBatchFromDump } from './core/propose-figma.ts';
        import { capturedTokensFromDump } from './core/captured-tokens.ts';
        import { emitHtml } from './core/emit-html.ts';
        import { mintedTokenCss } from './core/mint-tokens.ts';
        import { tokenInventoryFromJson } from './core/tokens.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const corpus = loadTokenCorpus(process.cwd());
        const loaded = loadContracts(path.resolve('contracts'));
        const dump = j('extract/figma/fixtures/cbds-plugin-button-brand-primary.dump.json');
        const batch = proposeBatchFromDump(dump, { corpus, contractIdByName: loaded.byName, contractsById: loaded.byId, fileKey: 'WofZT8xaxXuc2Q6Je9S4XE', mintUnbound: true });
        const p = batch.proposals[0];
        const c = ContractSchema.parse(p.contract);
        const contracts = new Map([[c.id, c]]);
        for (const s of p.childStubs ?? []) { const sc = ContractSchema.parse(s); contracts.set(sc.id, sc); }
        const captured = capturedTokensFromDump(dump);
        const inv = tokenInventoryFromJson([j('tokens/primitives.tokens.json'), j('tokens/semantic.tokens.json'), j('tokens/modes/semantic.light.tokens.json'), captured.tree, p.mintedTokens?.tree ?? {}]);
        const emitted = emitHtml(c, { tokens: inv, icons: new Map(), contracts });
        // The playground preview stylesheet layering: captured + minted token
        // custom properties, then the emitted component CSS.
        const doc = '<!doctype html><html><head><meta charset="utf-8"><style>' + mintedTokenCss(captured.tree) + '\\n' + mintedTokenCss(p.mintedTokens?.tree ?? {}) + '</style><style>body{margin:0;padding:32px}</style><style>' + emitted.css + '</style></head><body>' + emitted.html + '</body></html>';
        (async () => {
          const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
          try {
            const page = await browser.newPage();
            await page.setContent(doc, { waitUntil: 'load' });
            const r = await page.evaluate("(() => { const toHex = (rgb) => '#' + rgb.match(/\\\\d+/g).slice(0,3).map((n) => (+n).toString(16).padStart(2,'0')).join(''); const items = [...document.querySelectorAll('.showcase__item')]; const disabledItem = items.find((it) => it.querySelector('.button-brand-primary:disabled')); const el = disabledItem.querySelector('.button-brand-primary'); const label = el.querySelector('.button-brand-primary__Button'); const defaultEl = items[0].querySelector('.button-brand-primary'); const defaultLabel = defaultEl.querySelector('.button-brand-primary__Button'); return { bg: toHex(getComputedStyle(el).backgroundColor), label: toHex(getComputedStyle(label).color), defaultLabel: toHex(getComputedStyle(defaultLabel).color) }; })()");
            if (r.bg !== '#dfe3eb') throw new Error('disabled fill computed ' + r.bg + ', expected #dfe3eb ({bg.disabled})');
            if (r.label !== '#556275') throw new Error('disabled label computed ' + r.label + ', expected #556275 ({text.disabled}) — the near-invisible-label class');
            if (r.defaultLabel !== '#fcfeff') throw new Error('default label computed ' + r.defaultLabel + ', expected #fcfeff ({text.inverse-primary})');
            console.log('disabled label computes #556275 on #dfe3eb; default label stays #fcfeff');
          } finally { await browser.close(); }
        })().catch((e) => { console.error(e); process.exit(1); });
      `]);
      if (probe.status !== 0 || !probe.out.includes('disabled label computes #556275 on #dfe3eb; default label stays #fcfeff')) {
        throw new Error(`disabled-label browser probe failed:\n${probe.out}`);
      }
    },
  },
  {
    // Owner field case (CBDS Tooltip): the root's DROP_SHADOW must mint
    // byte-equal to the dump (0px 2px 4px #00000029), render on the CSS
    // surface, AND project onto the canvas surfaces as a native effect —
    // the exact channel whose loss made the imported tooltip "look
    // unstyled". Fixture replay of the owner's live node (695-313).
    id: 'design-shadow-mints-and-renders',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/tooltip-check.ts']);
      if (r.status !== 0) throw new Error(`Tooltip receipt failed:\n${r.out}`);
      for (const line of [
        "✔ box-shadow MINTED byte-equal to the dump's DROP_SHADOW (0px 2px 4px #00000029)",
        '✔ emitReact CSS: box-shadow declaration on the root',
        '✔ canvas spec: root carries the native DROP_SHADOW (0/2/4 #00000029 — numeric equality with the dump)',
        '✔ the shadow note states the canvas surfaces PROJECT it (the v1 "no box-shadow projection" limit is retired)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner field case (CBDS Tooltip): the Pointer REGULAR_POLYGON is a REAL
    // part — triangle geometry + rotation carried (#42, dump v1.3), and the
    // pointer-position axis drives genuinely DIFFERENT absolute placements
    // whose offsets equal the captured boxes exactly.
    id: 'design-pointer-geometry-carried',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/tooltip-check.ts']);
      if (r.status !== 0) throw new Error(`Tooltip receipt failed:\n${r.out}`);
      for (const line of [
        '✔ Pointer is a REAL shape part: polygon, 3 sides, 12×12 (dump intrinsic size)',
        "✔ Pointer fill resolves to the dump's #fcfeff",
        '✔ top-right placement EXACT from the captured box (right: 12px, top: -8px, rotation 0)',
        '✔ bottom-left placement EXACT (left: 12px, bottom: -8px, rotate(180deg))',
        '✔ left-center placement EXACT (left: -8px, vertically centered, rotate(-90deg))',
        '✔ the three placements genuinely DIFFER',
        '✔ canvas spec: pointer compiles to a shape node with per-variant constraints + rotation (top-right MAX/MIN rot0 · bottom-left MIN/MAX rot180 · left-center MIN/CENTER rot-90)',
        '✔ sync script constructs a REAL polygon with native rotation + ABSOLUTE placement + DROP_SHADOW effect + PIXELS line height',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner field case (CBDS Tooltip): pointer=false must render NO arrow —
    // the boolean the set already carries drives the part on every surface
    // (visibleWhen inverted from the hidden pattern), and the never-drawn
    // pointer-position=none combo is suppressed rather than guessed.
    id: 'design-pointer-false-no-arrow',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/tooltip-check.ts']);
      if (r.status !== 0) throw new Error(`Tooltip receipt failed:\n${r.out}`);
      for (const line of [
        '✔ visibleWhen { prop: pointer } inverted from the hidden pattern (boolean axis)',
        '✔ emitReact TSX: the arrow renders conditionally ({pointer ? …})',
        '✔ pointer-position=none suppresses the arrow even against defaults (display: none stylesWhen)',
        '✔ canvas spec: the pointer-position=none variant compiles WITHOUT the shape node (suppressed)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner follow-up (same tooltip): the Semi Bold title and the 16px line
    // height must CARRY — font-weight through the bounded weight-name table,
    // line-height when the canvas spells PIXELS (dump v1.3) — with numeric
    // equality against the dump on the emitted surface.
    id: 'design-text-weight-and-line-height-carried',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/tooltip-check.ts']);
      if (r.status !== 0) throw new Error(`Tooltip receipt failed:\n${r.out}`);
      for (const line of [
        '✔ Main text ("Semi Bold") font-weight resolves to 600 EXACTLY (weight-name table)',
        '✔ Main text line-height resolves to 16px EXACTLY (dump v1.3 PIXELS)',
        '✔ Supporting text ("Regular") font-weight resolves to 400 + line-height 16px',
        '✔ emitReact CSS: font-weight + line-height declarations on both text parts',
        '✔ canvas spec: text nodes carry Semi Bold + lineHeight 16 (weight table + dump v1.3)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner field failure (first live Send-to-Playground, CBDS UI Kit Demo):
    // private-helper names ("_Avatar Indicator"), template names
    // ("Button / Primary / Medium", "Type=Text, Variant=Error"), and the
    // child-stub ids derived from them produced contract ids the schema
    // refuses. The rule: sanitize AT PROPOSAL (componentIdSlug — the
    // prop-identifier discipline), every changed spelling a NAMED note, the
    // component ref and its stub sharing ONE function so they cannot drift.
    // Receipt runs over the LIVE plugin-transport dumps, committed verbatim.
    id: 'design-id-sanitize-at-proposal',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-batch-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS batch receipt failed:\n${r.out}`);
      for (const line of [
        '✔ componentIdSlug("_variable-list-item") = "variable-list-item"',
        '✔ componentIdSlug("Button / Primary / Medium") = "button-primary-medium"',
        '✔ componentIdSlug("Type=Text, Variant=Error") = "type-text-variant-error"',
        '✔ componentIdSlug("01 Icons") = "c-01-icons"',
        '✔ "_variable-list-item" proposes with id "ds.variable-list-item"',
        '✔ its sanitize note NAMES the original spelling and the rule',
        '✔ "Avatar" child stub id is "ds.avatar-indicator"',
        '✔ the anatomy component ref uses the SAME sanitized id as the stub',
        '✔ the stub-id sanitize note NAMES "_Avatar Indicator" → "ds.avatar-indicator"',
        '✔ no "ds.-" id survives anywhere in the Avatar proposal or its stubs',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // The other half of the field failure: ONE bad set killed the WHOLE
    // receive and the raw zod issue array rendered verbatim in the rail.
    // proposeBatchFromDump (the function the playground receive paths run)
    // must complete the full ALL-SETS replay with zero raw errors, name a
    // poisoned set as a plain-words skip while the rest import, name real
    // sanitized-id collisions, and never headline machine text.
    id: 'design-batch-isolation-plain-words-skips',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-batch-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS batch receipt failed:\n${r.out}`);
      for (const line of [
        '✔ every set accounted for: proposed + skipped = total',
        '✔ ALL 1618 sets propose (zero skips on the live dump after sanitize)',
        '✔ every proposed id satisfies the schema pattern',
        '✔ the real id collision ("RadioButton" vs "Radio button" → ds.radio-button) is NAMED, never silent',
        '✔ the healthy set still proposes',
        '✔ the poisoned set is a NAMED skip',
        '✔ the skip reason is plain words ("Set "Poisoned" could not be proposed: …"), not machine output',
        '✔ a thrown zod error formats as words ("the proposed contract did not fit the contract schema — …")',
        '✔ the raw zod text survives as expandable detail, not the headline',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner P0 (the final link — his CBDS Button-Brand Primary bridge send):
    // the proposal bound his REAL token names and the playground referee
    // refused ALL NINE ("does not exist in tokens/") because it knew only the
    // repo corpus. Dump v1.4 carries each bound variable's RESOLVED value
    // (_variables); the playground registers them as an import-scoped token
    // layer (core/captured-tokens.ts + token-source capturedLayer, repo
    // tokens winning on name collision), so the referee resolves his names
    // and the preview renders HIS values — ZERO refusals, pinned numerically
    // against the committed fixture, with the refusal reproduced as a control.
    id: 'design-imported-token-layer-registration-resolution',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-bridge-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS bridge receipt failed:\n${r.out}`);
      for (const line of [
        '✔ 18 variables captured, 18 registrable, 0 skipped',
        '✔ captured {bg.brand.default} resolves EXACTLY to #0e61ba',
        '✔ captured {spacing.200} resolves EXACTLY to 16px',
        '✔ zero captured names shadow repo tokens — all 18 register',
        '✔ ZERO referee violations (got 0)',
        '✔ in particular: zero "does not exist in tokens/" refusals (the owner saw NINE)',
        '✔ control: WITHOUT the captured layer the referee refuses his real names by name',
        '✔ renders a focusable <button> (not a div)',
        '✔ computed background = #0e61ba from HIS {bg.brand.default} (got #0e61ba)',
        '✔ :hover computed background = #003e81 from HIS {bg.brand.hover} (got #003e81)',
        '✔ :active computed background = #002854 from HIS {bg.brand.pressed} (got #002854)',
        '✔ :disabled computed background = #dfe3eb from HIS {bg.disabled} (got #dfe3eb)',
        '✔ :focus-visible computed outline-color = #0e61ba from HIS {border.focus} (got #0e61ba)',
        '✔ label computed color = #fcfeff from HIS {text.inverse-primary} (got #fcfeff)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner P0 (axis-correlation): his notes showed root paddingLeft/
    // paddingRight ({spacing.200} vs {spacing.150}) and height
    // ({component-size.xlarge|large|medium}) dropped as 'bindings differ
    // across variants without correlating to any variant axis'. TRUE root
    // cause (his state-variant hypothesis disproven by replay — base facts
    // already come from default-state variants only): unifyRefs required the
    // differing path SEGMENT to spell camel(axisValue) ('200' ≠ 'large').
    // Correlation now also works by VALUE over the default-state occurrences
    // — a plain function of ONE enum axis, injectivity NOT required
    // (large/medium sharing {spacing.200} is still a function of size) —
    // and carries as tokensByProp with his real refs.
    id: 'design-correlation-over-default-state-occurrences',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-bridge-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS bridge receipt failed:\n${r.out}`);
      for (const line of [
        '✔ root padding-inline base = {spacing.200} (large/medium)',
        '✔ tokensByProp rides the `size` axis',
        '✔ tokensByProp small override: padding-inline = {spacing.150}',
        '✔ large/medium share {spacing.200} — a valid (non-injective) function of size, no medium padding override needed',
        '✔ root height base = {component-size.xlarge} (large)',
        '✔ tokensByProp medium override: height = {component-size.large}',
        '✔ tokensByProp small override: height = {component-size.medium}',
        '✔ the old drift note is GONE (no "bindings differ across variants without correlating" for padding/height)',
        '✔ size=small: computed padding-inline = 12px from {spacing.150} (got 12px)',
        '✔ size=small: computed height = 32px from {component-size.medium} (got 32px)',
        '✔ size=medium: computed height = 40px from {component-size.large} (got 40px)',
        '✔ computed padding-inline = 16px (large; got 16px)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner P0 (global part-name dedup): his Dialog refused with 'duplicate
    // anatomy part name "Title"' + '"Icon"'. Part names are contract-wide
    // identity (CSS classes, swap layers, note paths) but the proposer
    // deduped only among SIBLINGS — his Title[FRAME] > Title[TEXT] nest and
    // two Icon instances under DIFFERENT parents slipped through to an emit
    // refusal. Fixed with a contract-global registry in partKey: pre-order
    // claiming (first drawn part keeps its name), parent-derived prefix for
    // later collisions ("frame2Icon"), else ordinal ("Title2"); every rename
    // a NAMED note carrying the node path.
    id: 'design-dialog-global-part-dedup',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/dialog-check.ts']);
      if (r.status !== 0) throw new Error(`Dialog dedup receipt failed:\n${r.out}`);
      for (const line of [
        '✔ 1 proposed, 0 skipped (the send completes)',
        '✔ part names are UNIQUE contract-wide (17 parts, 17 distinct)',
        '✔ the drawn "Title" WRAPPER keeps its name (first drawn part wins)',
        '✔ the "Title" TEXT inside it takes the ordinal — "Title2" (parent key IS the colliding name, so no prefix)',
        '✔ the second "Icon" (close icon, under "Frame 2") takes the parent-derived prefix — "frame2Icon"',
        '✔ the "Title" rename is a NAMED note carrying the node path',
        '✔ the "Icon" rename is a NAMED note carrying the node path',
        '✔ BOTH _Slot-Dialog underscore-instances carry as slots (swap-bound INSTANCE_SWAP → slot parts, sanitized names)',
        '✔ all FOUR action-button component refs present under Actions',
        '✔ BOTH Icon instances (title icon + close icon) reference the ds.icon stub',
        '✔ the scroll bar carries (hidden RECTANGLE → "scrollBar" part)',
        '✔ ZERO referee violations (got 0)',
        "✔ in particular: zero 'duplicate anatomy part name' refusals (the owner's Dialog refusal class)",
        '✔ emitHtml renders (validateContract passed — the duplicate refusal is GONE)',
        '✔ the canvas compiles — 4 variants (size axis; got 4)',
        '✔ its id rides the sanitize rule — "ds.modal-confirmation-dialog" (got ds.modal-confirmation-dialog)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner P0 (canvas metrics): the Code preview rendered his Button right
    // (16/12 padding-inline, 48/40/32 heights) but the CANVAS drew too-tall
    // uniform boxes (~64px, all sizes identical). Two root causes, fixed:
    // (1) compileComponentData applied `root.tokens` instead of
    // resolveTokens(root, subst) — the ROOT's tokensByProp per-size overrides
    // never reached the compiled specs (child parts already resolved right);
    // (2) the canvas preview drew content-box divs, so a bound 48px height
    // PLUS 8px padding-block rendered 64px — Figma boxes are border-box.
    // The receipt pins all 15 cells box-equal to the dump's own captured
    // variant boxes, per-size differences differing, and the border-box rule.
    id: 'design-canvas-box-parity',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/canvas-box-check.ts']);
      if (r.status !== 0) throw new Error(`canvas-box receipt failed:\n${r.out}`);
      for (const line of [
        '✔ 15 canvas cells compile (got 15)',
        '✔ every cell name maps to a distinct captured variant',
        '✔ cell "size=large" box == captured "size=large, state=default" box (h=48 via component-size/xlarge, pad=[8,16,8,16], gap=8, hug width)',
        '✔ cell "size=medium" box == captured "size=medium, state=default" box (h=40 via component-size/large, pad=[8,16,8,16], gap=8, hug width)',
        '✔ cell "size=small" box == captured "size=small, state=default" box (h=32 via component-size/medium, pad=[8,12,8,12], gap=8, hug width)',
        '✔ cell "size=small, State=Focus Visible" box == captured "size=small, state=focus" box (h=32 via component-size/medium, pad=[8,12,8,12], gap=8, hug width)',
        '✔ cell "size=small" text 14px/21px == captured 14px/21px',
        '✔ heights 48/40/32 per size, DISTINCT (got large=48, medium=40, small=32)',
        '✔ padding-inline 16/16/12 — small DIFFERS (got large=16, medium=16, small=12)',
        '✔ min-height 44 stays CSS-side BY DESIGN (the canvas draws the real per-variant height; the contract carries the fact for the code surfaces)',
        '✔ the canvas stylesheet declares box-sizing: border-box (a FIXED height includes padding, like Figma — 48px means 48px, not 48+8+8)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // Owner P0 (AI-fix guardrails): Fix-with-AI resolved his Dialog's
    // duplicate-part-name refusals by DELETING parts — the rendered Dialog
    // lost its close icon and all four action buttons; legal per schema,
    // lossy in fact, and nothing said so. The worker's fix-contract prompt
    // now FORBIDS removal-as-fix (rename/dedup/restructure instead) and the
    // forced tool carries a machine-readable `removals` declaration channel
    // (shape-checked passthrough; missing → []); the playground diffs every
    // AI round against the pre-fix contract and renders deletions loud/red
    // (undeclared losses loudest). This eval runs the worker test suite —
    // guardrail prompt text, removals schema, passthrough filtering — in the
    // scratch copy via the root tsx.
    id: 'design-ai-fix-removal-guardrails',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['--test', 'workers/assist/test/handler.test.ts', 'workers/assist/test/bridge.test.ts']);
      if (r.status !== 0) throw new Error(`worker test suite failed:\n${r.out.slice(0, 4000)}`);
      for (const line of [
        'fix-contract: the system prompt forbids removal-as-fix and demands declared removals',
        'fix-contract: the forced tool schema carries the removals declaration channel',
        'fix-contract: declared removals pass through shape-checked — junk dropped, unknown kind folds to "other"',
        'fix-contract: a response without removals answers an EMPTY array — never invented, never undefined',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing worker test: ${line}`);
      }
      // node --test's summary prefix is reporter-dependent ("# fail 0" tap,
      // "ℹ fail 0" spec) — the assertion is zero failures either way.
      if (!/(#|ℹ) fail 0/.test(r.out)) throw new Error(`worker suite reports failures:\n${r.out.slice(-2000)}`);
    },
  },
  {
    // Owner P0 (min/max sizing): his minHeight 44 dropped as
    // [min-max-size-unsupported] ×15. Dump v1.4 carries literal min/max
    // sizing as node facts; the proposer mints them as bounded, exact px
    // style facts (min-height/min-width/max-height/max-width) — the
    // tap-target renders, and the degradation is retired for literal cases.
    id: 'design-min-height-carried',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/cbds-bridge-check.ts']);
      if (r.status !== 0) throw new Error(`CBDS bridge receipt failed:\n${r.out}`);
      for (const line of [
        '✔ root min-height binds a minted px fact',
        '✔ min-height resolves EXACTLY to 44px (got 44px)',
        '✔ the min-max-size-unsupported degradation is RETIRED for the literal case (fixture carries zero)',
        '✔ computed min-height = 44px (got 44px)',
        '✔ zero UNBOUND leftovers (every raw literal minted or refused by name)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // a11y.minHitArea is ENFORCED by emitted CSS (declared floor → the
    // centered ::before extension, both css surfaces), and the number FLOWS
    // from the contract (raising it re-emits the raised floor — not
    // hardcoded).
    id: 'hit-area-enforced',
    claim: 'C1-determinism',
    run: () => {
      if (generate().status !== 0) throw new Error('generate failed');
      const css = readFileSync(path.join(SCRATCH, 'src/components/Button/Button.module.css'), 'utf8');
      if (!css.includes('.root::before')) throw new Error('minHitArea ::before extension missing');
      if (!css.includes('width: max(100%, 44px);') || !css.includes('height: max(100%, 44px);')) {
        throw new Error('declared 44px floor not enforced per axis');
      }
      const rootBlock = css.slice(css.indexOf('.root {'), css.indexOf('}', css.indexOf('.root {')));
      if (!rootBlock.includes('position: relative;')) throw new Error('root lost the positioning context for the hit-target extension');
      // The floor flows from the contract.
      editJson('contracts/button.contract.json', (c) => {
        c.a11y.minHitArea = 48;
      });
      if (generate().status !== 0) throw new Error('generate failed after minHitArea edit');
      const raised = readFileSync(path.join(SCRATCH, 'src/components/Button/Button.module.css'), 'utf8');
      if (!raised.includes('max(100%, 48px)')) throw new Error('raised floor did not flow into the emitted CSS');
    },
  },
  {
    // T035a (FR-017): the generated Button is ACCESSIBLE — it exposes an
    // implicit role="button" (a native <button> host) and a non-empty
    // accessible name flowing from the TEXT `children` binding. Fixture → eval
    // → claim: no doc may state "the Button is accessible" without this.
    id: 'a11y-role-and-accessible-name',
    claim: 'C1-determinism',
    run: () => {
      if (generate().status !== 0) throw new Error('generate failed');
      const tsx = readFileSync(path.join(SCRATCH, BTN_TSX), 'utf8');
      // role: a native <button> host carries the button role implicitly.
      if (!/<button[\s>]/.test(tsx) && !/role=["']button["']/.test(tsx)) {
        throw new Error('generated Button exposes neither a native <button> host nor role="button"');
      }
      // accessible name: the children binding renders as the host's text
      // content (here inside the label span), so a passed label names the button.
      if (!tsx.includes('{children}')) {
        throw new Error('children (accessible-name source) is not rendered into the Button');
      }
      // the name flows from the contract's TEXT binding, not hardcoded: the
      // label part binds content to the children prop.
      const contract = JSON.parse(readFileSync(path.join(SCRATCH, CONTRACT), 'utf8'));
      const label = contract.anatomy.root.parts?.label;
      if (label?.content?.prop !== 'children') {
        throw new Error('label content is not bound to the children prop — accessible name would not flow from the contract');
      }
    },
  },
  {
    // Icon-only Button: one contract variant hides the visual label by variant,
    // names the existing icon wrapper while keeping its SVG decorative, carries
    // square geometry, and composes named Carousel controls. Normal Buttons
    // keep native text naming — never an unconditional root aria-label.
    id: 'button-icon-only-and-carousel-controls',
    claim: 'C1-determinism',
    run: () => {
      if (generate().status !== 0) throw new Error('generate failed');
      const button = JSON.parse(readFileSync(path.join(SCRATCH, CONTRACT), 'utf8'));
      const iconOnly = button.props.find((p: { name: string }) => p.name === 'variant')?.type.enum.includes('iconOnly');
      if (!iconOnly) throw new Error('Button variant iconOnly missing');
      const root = button.anatomy.root;
      const layout = root.tokensByProp.map.iconOnly;
      if (layout.width !== '{size.button.icon-only}' || layout.height !== '{size.button.icon-only}' || layout.gap !== '{space.0}' || layout['padding-inline'] !== '{space.16}') {
        throw new Error(`iconOnly geometry mismatch: ${JSON.stringify(layout)}`);
      }
      const labelHide = root.parts.label?.stylesWhen?.find((rule: { prop: string; equals?: string; styles?: Record<string, string> }) =>
        rule.prop === 'variant' && rule.equals === 'iconOnly',
      );
      if (labelHide?.styles?.display !== 'none') {
        throw new Error('iconOnly must hide the visual label through a variant-driven style');
      }
      const buttonTsx = readFileSync(path.join(SCRATCH, BTN_TSX), 'utf8');
      const buttonCss = readFileSync(path.join(SCRATCH, 'src/components/Button/Button.module.css'), 'utf8');
      if (!buttonTsx.includes('<span className={styles.label}>{children}</span>')) {
        throw new Error('Button no longer emits the label content used by normal variants');
      }
      if (!buttonCss.includes('.variant-iconOnly .label {') || !buttonCss.includes('display: none;')) {
        throw new Error('iconOnly visual label is not hidden by its variant class');
      }
      if (!/className=\{styles\.iconOnlyIcon\}[\s\S]*?aria-label=\{String\(children\)\}[\s\S]*?dangerouslySetInnerHTML/.test(buttonTsx)) {
        throw new Error('iconOnly icon wrapper does not carry the accessible name and inline SVG together');
      }
      if (buttonTsx.includes('iconOnlyIconGlyph')) {
        throw new Error('iconOnly invented a second glyph wrapper instead of naming the existing icon anatomy node');
      }
      const rootStart = buttonTsx.indexOf('<button');
      const rootOpen = buttonTsx.slice(rootStart, buttonTsx.indexOf('>', rootStart));
      if (rootOpen.includes('aria-label')) {
        throw new Error('Button applies an unconditional root aria-label and can rename normal ReactNode children to "[object Object]"');
      }
      for (const declaration of ['width: var(--size-button-icon-only);', 'height: var(--size-button-icon-only);', 'gap: var(--space-0);']) {
        if (!buttonCss.includes(declaration)) throw new Error(`iconOnly CSS missing ${declaration}`);
      }
      const carousel = JSON.parse(readFileSync(path.join(SCRATCH, 'contracts/carousel-controls.contract.json'), 'utf8'));
      const parts = carousel.anatomy.root.parts;
      const expected = [
        ['prcdent', 'Précédent', 'chevron-left'],
        ['Suivant', 'Suivant', 'chevron-right'],
      ];
      for (const [partName, text, glyph] of expected) {
        const ref = parts[partName].component;
        if (ref.text !== text || ref.props.variant !== 'iconOnly' || ref.props.iconLeftGlyph !== glyph || ref.props.iconLeft !== false || ref.props.iconRight !== false) {
          throw new Error(`Carousel ${partName} is not the governed icon-only control: ${JSON.stringify(ref)}`);
        }
      }
    },
  },
  {
    // §3 (theme/mode-axis promotion, P17): a drawn Theme=Light|Dark variant
    // axis is a TOKEN MODE, never a component prop — the mirror image of
    // state promotion. Promotion requires the bounded name table AND
    // structural corroboration; base facts come from the default mode only;
    // mode-excluded variants never feed the mint pass; per-mode captured-
    // variable values ride the captured-token layer's modes channel (dump
    // v1.6). Near-misses stay enum props with NAMED notes.
    id: 'theme-axis-promotion',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/theme-mode-check.ts']);
      if (r.status !== 0) throw new Error(`theme-mode receipt failed:\n${r.out}`);
      for (const line of [
        '✔ NO `theme` prop ships in the API',
        '✔ contract `modes` metadata names the token modes (["light","dark"])',
        '✔ the promotion is the NAMED §3 receipt (corroboration + mint isolation + rename story spelled out)',
        '✔ base facts bind the REAL variable names from the light variants (background-color = {bg.{variant}}; got {bg.{variant}})',
        '✔ the DARK accent literal mints NOWHERE (#9ec2ff — mode-excluded variants never fabricate a second palette)',
        '✔ {bg.info} RESOLVES per mode — light #eef4ff, dark #0b1d3a (got #eef4ff / #0b1d3a)',
        '✔ the near-miss is a WARNING note naming the first structural difference (2 vs 3 children)',
        '✔ `theme` STAYS an enum prop (uncorroborated promotion never drops an axis silently)',
        '✔ the out-of-vocabulary value is a NAMED note; the axis stays a prop',
        '✔ `variant` ships as an enum prop (default|inverse)',
        '✔ no mode-axis note fires at all (the name table never matches "variant")',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  {
    // P21 (overlap collections): negative auto-layout spacing must NEVER
    // mint a plain negative-px gap token (`gap: -8px` is invalid CSS and the
    // overlap silently vanished — the pre-P21 bug). Uniform negative spacing
    // inverts to the existing `layout.overlap` vocabulary with the drawn
    // magnitude on the gap token (the ds.avatar-group owner-precedent:
    // {space.overlap} = -8px, projected as a negative child margin / negative
    // itemSpacing); mixed-sign spacing is a NAMED per-part-invariant limit.
    // Receipt replays the owner's live Avatar group census fixture.
    id: 'negative-spacing-overlap',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/overlap-check.ts']);
      if (r.status !== 0) throw new Error(`overlap receipt failed:\n${r.out}`);
      for (const line of [
        '✔ root proposes layout.overlap: true (children OVERLAP — P21)',
        '✔ the overlap carry is a NAMED note (owner-precedent projection spelled out)',
        '✔ the minted gap token carries the DRAWN magnitude -8px (got -8px)',
        '✔ CSS projects the overlap as a negative CHILD MARGIN (.root > * + * { margin-left: … })',
        '✔ CSS never emits the invalid `gap:` declaration for the overlap token',
        '✔ the mixed-sign limit is a NAMED note (per-part invariant, gap NOT minted)',
        '✔ layout.overlap is NOT set (overlap holds in only half the variants — never guessed)',
        '✔ NO negative px token mints anywhere (got 0; the pre-P21 bug class is gone)',
        '✔ the unbound itemSpacing report SURVIVES for review',
        '✔ the bound-negative channel keeps its existing NAMED refusal (illegal variable name — rename or map manually)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },

  // -------------------------------------------------------------------------
  // POLARIS SHOWCASE (examples/polaris) — the Phase A end-to-end artifact.
  // -------------------------------------------------------------------------
  {
    // COVERAGE ROUND workstream 1: var() chains resolve to SAME-PACKAGE
    // literal definitions (depth-capped, cycles refused BY NAME, bounded
    // calc() evaluated deterministically) — and the committed contracts
    // carry the resulting facts (ProgressBar per-size heights, Avatar
    // per-size widths) as schema-v14 literals with provenance.
    id: 'var-chain-resolution',
    claim: 'C5-extraction',
    run: () => {
      const rules = parseModuleCss(`
        .Root {
          --base: 16px;
          --alias: var(--base);
          --half: calc(var(--base) * 0.5);
          --loop-a: var(--loop-b);
          --loop-b: var(--loop-a);
          --tok: var(--p-space-100);
        }
      `);
      const defs = customPropDefs(rules, new Set(['Root']));
      const lookup: TokenLookup = {
        pathOfVar: (v) => (v === 'p-space-100' ? 'p.space-100' : undefined),
      };
      const chain = resolveToRef('var(--alias)', defs, lookup);
      if (chain.kind !== 'literal' || chain.value !== '16px') {
        throw new Error(`chain literal: expected 16px literal, got ${JSON.stringify(chain)}`);
      }
      if (!chain.via.includes('--alias') || !chain.via.includes('--base') || chain.defSelector !== '.Root') {
        throw new Error(`chain literal provenance missing: ${JSON.stringify(chain)}`);
      }
      const calc = resolveToRef('var(--half)', defs, lookup);
      if (calc.kind !== 'literal' || calc.value !== '8px') {
        throw new Error(`calc over resolved literal: expected 8px, got ${JSON.stringify(calc)}`);
      }
      const cyc = resolveToRef('var(--loop-a)', defs, lookup);
      if (cyc.kind !== 'refused' || !cyc.reason.includes('var() cycle') || !cyc.reason.includes('--loop-a')) {
        throw new Error(`cycle must refuse BY NAME, got ${JSON.stringify(cyc)}`);
      }
      const tok = resolveToRef('var(--tok)', defs, lookup);
      if (tok.kind !== 'ref' || tok.ref !== '{p.space-100}') {
        throw new Error(`token chains must still resolve to refs, got ${JSON.stringify(tok)}`);
      }
      const raw = resolveToRef('4px', defs, lookup);
      if (raw.kind !== 'refused' || !raw.reason.includes('never turned into an invented token')) {
        throw new Error(`a RAW literal (no chain) must still refuse, got ${JSON.stringify(raw)}`);
      }
      // The committed contracts carry the resolved facts.
      const pb = JSON.parse(readFileSync(path.join(ROOT, 'examples/polaris/contracts/progress-bar.contract.json'), 'utf8'));
      const pbMap = pb.anatomy.root.literalsByProp?.[0];
      if (pbMap?.prop !== 'size' || pbMap.map.small?.height !== '8px' || pbMap.map.medium?.height !== '16px' || pbMap.map.large?.height !== '32px') {
        throw new Error(`progress-bar per-size literal heights not carried: ${JSON.stringify(pb.anatomy.root.literalsByProp)}`);
      }
      const av = JSON.parse(readFileSync(path.join(ROOT, 'examples/polaris/contracts/avatar.contract.json'), 'utf8'));
      const avMap = av.anatomy.root.literalsByProp?.[0];
      if (avMap?.prop !== 'size' || avMap.map.xs?.width !== '20px' || avMap.map.xl?.width !== '40px') {
        throw new Error(`avatar per-size literal widths not carried: ${JSON.stringify(av.anatomy.root.literalsByProp)}`);
      }
      // NARROWED refusals: unresolvable vars name their class.
      const ledger = readFileSync(path.join(ROOT, 'examples/polaris/extraction/PROMOTION.md'), 'utf8');
      if (!ledger.includes('is RUNTIME-SET')) throw new Error('no RUNTIME-SET narrowed refusal in PROMOTION.md');
      if (!/MEDIA-DEPENDENT|defined only in other class contexts/.test(ledger)) {
        throw new Error('no narrowed media/class-context refusal in PROMOTION.md');
      }
    },
  },
  {
    // COVERAGE ROUND workstream 2: composition-owned typography — Button's
    // label typography flows through Polaris's Text primitive; the chain is
    // deterministic (literal props in Button.tsx), so the committed contract
    // carries it, resolved from Text's OWN CSS; runtime/multi-axis branches
    // are refused by name in the ledger.
    id: 'composition-typography-carry',
    claim: 'C5-extraction',
    run: () => {
      const btn = JSON.parse(readFileSync(path.join(ROOT, 'examples/polaris/contracts/button.contract.json'), 'utf8'));
      const label = btn.anatomy.root.parts?.label;
      if (!label) throw new Error('button contract has no label part');
      if (label.tokens?.['font-size'] !== '{p.text-body-sm-font-size}') {
        throw new Error(`label font-size not carried through Text: ${JSON.stringify(label.tokens)}`);
      }
      if (label.tokens?.['font-weight'] !== '{p.font-weight-medium}') {
        throw new Error(`label font-weight not carried through Text: ${JSON.stringify(label.tokens)}`);
      }
      const entries = Array.isArray(label.tokensByProp) ? label.tokensByProp : [label.tokensByProp].filter(Boolean);
      const sizeEntry = entries.find((e: { prop: string }) => e.prop === 'size');
      if (sizeEntry?.map?.large?.['font-size'] !== '{p.text-body-md-font-size}') {
        throw new Error(`size=large bodyMd upgrade not carried: ${JSON.stringify(entries)}`);
      }
      const variantEntry = entries.find((e: { prop: string }) => e.prop === 'variant');
      if (variantEntry?.map?.plain?.['font-weight'] !== '{p.font-weight-regular}') {
        throw new Error(`variant=plain regular weight not carried: ${JSON.stringify(entries)}`);
      }
      const ledger = readFileSync(path.join(ROOT, 'examples/polaris/extraction/PROMOTION.md'), 'utf8');
      if (!ledger.includes('media-dependent RUNTIME branch')) {
        throw new Error('the mdUp fontWeight branch must be a named refusal');
      }
      if (!ledger.includes('conditioned on BOTH variant and size')) {
        throw new Error('the plain+size bodyMd branch must be a named two-axis refusal');
      }
      // Banner title rides Text headingSm the same way. Round 4: the title
      // sits at its PROMOTED nesting position (root › … › ribbon row), so
      // the pin walks the anatomy for it instead of assuming a flat path.
      const banner = JSON.parse(readFileSync(path.join(ROOT, 'examples/polaris/contracts/banner.contract.json'), 'utf8'));
      let bannerTitle: { tokens?: Record<string, string> } | null = null;
      const findTitle = (name: string, part: { tokens?: Record<string, string>; parts?: Record<string, never> }) => {
        if (name === 'title') bannerTitle = part;
        for (const [n, c] of Object.entries(part.parts ?? {})) findTitle(n, c);
      };
      for (const [n, c] of Object.entries(banner.anatomy)) findTitle(n, c as never);
      if (!bannerTitle || (bannerTitle as { tokens?: Record<string, string> }).tokens?.['font-size'] !== '{p.text-heading-sm-font-size}') {
        throw new Error('banner title headingSm typography not carried');
      }
    },
  },
  {
    // COVERAGE ROUND workstream 3: multiple tokensByProp entries per part —
    // ordered later-wins semantics, and the refusal rules: a conflicting
    // channel+prop pair (same prop AND same channel in two entries, within
    // tokensByProp or across tokensByProp/literalsByProp) refuses BY NAME.
    id: 'multi-tokensbyprop-refusals',
    claim: 'C2-refusal',
    run: () => {
      const mk = (rootExtra: Record<string, unknown>): SchemaContract =>
        ContractSchema.parse({
          id: 'ds.evalfixture',
          name: 'EvalFixture',
          version: '1.0.0',
          description: 'Eval fixture.',
          semantics: { element: 'div' },
          props: [
            {
              name: 'size',
              type: { enum: ['sm', 'lg'] },
              default: 'sm',
              bindings: { figma: { kind: 'VARIANT', property: 'Size' }, code: { prop: 'size' } },
            },
            {
              name: 'variant',
              type: { enum: ['a', 'b'] },
              default: 'a',
              bindings: { figma: { kind: 'VARIANT', property: 'Variant' }, code: { prop: 'variant' } },
            },
          ],
          anatomy: { root: rootExtra },
          anchors: {
            figma: { fileKey: null, componentSetKey: null },
            code: { importPath: 'src/components/EvalFixture', export: 'EvalFixture' },
          },
        });
      // Ordered later-wins: two entries on DIFFERENT props overriding the
      // same channel — the later entry wins for a combo carrying both.
      const ok = mk({
        tokens: { color: '{color.text.primary}' },
        tokensByProp: [
          { prop: 'variant', map: { b: { color: '{color.text.secondary}' } } },
          { prop: 'size', map: { lg: { color: '{color.text.tertiary}' } } },
        ],
      });
      const errs: string[] = [];
      coreValidateContract(ok, new Map([[ok.id, ok]]), errs, new Map());
      if (errs.length > 0) throw new Error(`clean multi-entry contract must validate: ${errs.join('; ')}`);
      const resolved = schemaResolveTokens(ok.anatomy.root as SchemaPart, { variant: 'b', size: 'lg' });
      if (resolved.color !== '{color.text.tertiary}') {
        throw new Error(`later entry must win per channel, got ${resolved.color}`);
      }
      const resolvedFirst = schemaResolveTokens(ok.anatomy.root as SchemaPart, { variant: 'b', size: 'sm' });
      if (resolvedFirst.color !== '{color.text.secondary}') {
        throw new Error(`non-overridden combo must keep the earlier entry, got ${resolvedFirst.color}`);
      }
      // Conflicting channel+prop pair — refused by name.
      const conflict = mk({
        tokensByProp: [
          { prop: 'size', map: { sm: { color: '{color.text.primary}' } } },
          { prop: 'size', map: { lg: { color: '{color.text.secondary}' } } },
        ],
      });
      const errs2: string[] = [];
      coreValidateContract(conflict, new Map([[conflict.id, conflict]]), errs2, new Map());
      if (!errs2.some((e) => e.includes('conflicting channel+prop pair'))) {
        throw new Error(`same prop+channel in two entries must refuse by name; got: ${errs2.join('; ') || '(none)'}`);
      }
      // Cross-kind conflict (tokensByProp vs literalsByProp) — refused too.
      const crossKind = mk({
        tokensByProp: { prop: 'size', map: { sm: { height: '{size.control.sm}' } } },
        literalsByProp: [{ prop: 'size', map: { lg: { height: '32px' } } }],
      });
      const errs3: string[] = [];
      coreValidateContract(crossKind, new Map([[crossKind.id, crossKind]]), errs3, new Map());
      if (!errs3.some((e) => e.includes('conflicting channel+prop pair'))) {
        throw new Error(`token/literal same prop+channel must refuse by name; got: ${errs3.join('; ') || '(none)'}`);
      }
      // Literal channel whitelist — box-shadow is not a literal channel.
      const badChannel = mk({ literals: { 'box-shadow': '0px' } });
      const errs4: string[] = [];
      coreValidateContract(badChannel, new Map([[badChannel.id, badChannel]]), errs4, new Map());
      if (!errs4.some((e) => e.includes('not a literal channel'))) {
        throw new Error(`non-whitelisted literal channel must refuse by name; got: ${errs4.join('; ') || '(none)'}`);
      }
      // Token + literal on the SAME base channel — ambiguous, refused.
      const dupBase = mk({
        tokens: { height: '{size.control.sm}' },
        literals: { height: '16px' },
      });
      const errs5: string[] = [];
      coreValidateContract(dupBase, new Map([[dupBase.id, dupBase]]), errs5, new Map());
      if (!errs5.some((e) => e.includes('BOTH a token binding and a literal'))) {
        throw new Error(`token+literal same base channel must refuse by name; got: ${errs5.join('; ') || '(none)'}`);
      }
      // The committed Text contract exercises the lift: variant AND
      // fontWeight maps, in CSS source order (fontWeight later — Polaris's
      // own cascade comment).
      const text = JSON.parse(readFileSync(path.join(ROOT, 'examples/polaris/contracts/text.contract.json'), 'utf8'));
      const tEntries = text.anatomy.root.tokensByProp;
      if (!Array.isArray(tEntries)) throw new Error('text contract must carry MULTIPLE tokensByProp entries');
      const props = tEntries.map((e: { prop: string }) => e.prop);
      if (!(props.includes('variant') && props.includes('fontWeight') && props.includes('tone'))) {
        throw new Error(`text must carry variant+fontWeight+tone maps, got ${props.join(',')}`);
      }
      if (props.indexOf('fontWeight') < props.indexOf('variant')) {
        throw new Error('fontWeight entry must come AFTER variant (CSS source order — later wins)');
      }
    },
  },
  {
    // spec 023 (E1): the section's `colonnes` {2,3} enum drives a grid part's
    // track count through a per-enum `columns` override on layoutByProp —
    // CARRY-BOTH (code emits grid-template-columns:repeat(N,minmax(0,1fr)) under
    // the enum class; the canvas sets gridColumnCount per compiled combo,
    // emit-figma-script l.3568 reading the resolved layout). The override is
    // licit ONLY when the part's BASE layout is display:"grid" — a columns
    // override on a non-grid part is refused BY NAME, the value-level mirror of
    // the base columns↔grid refine (contract-schema.ts l.181-187). This case
    // backs the capability BEFORE any docs claim (Principle II): the positive
    // path emits BOTH track templates ON ALL THREE CSS SURFACES (react / html /
    // react-inline — the field-copy in each emitter's layout override is easy to
    // forget, so a mono-surface case is not enough), the negative path fails
    // validation with a named message. (The Figma-side byte determinism lands in golden.json when
    // the ds.categories-principales section contract is extracted — task T030.)
    id: 'columns-override-grid-only',
    claim: 'C2-refusal',
    run: () => {
      const mk = (baseLayout: Record<string, unknown>): SchemaContract =>
        ContractSchema.parse({
          id: 'ds.evalcolumns',
          name: 'EvalColumns',
          version: '1.0.0',
          description: 'Eval fixture — E1 columns override.',
          semantics: { element: 'div' },
          props: [
            {
              name: 'colonnes',
              type: { enum: ['2', '3'] },
              default: '2',
              bindings: { figma: { kind: 'VARIANT', property: 'Colonnes' }, code: { prop: 'colonnes' } },
            },
            {
              name: 'titre',
              type: 'text',
              bindings: { figma: { kind: 'TEXT', property: 'Titre' }, code: { prop: 'titre' } },
            },
          ],
          anatomy: {
            root: {
              layout: { display: 'flex', direction: 'column' },
              parts: {
                grid: {
                  layout: baseLayout,
                  layoutByProp: { prop: 'colonnes', map: { '3': { columns: 3 } } },
                  parts: { cell: { content: { prop: 'titre' } } },
                },
              },
            },
          },
          anchors: {
            figma: { fileKey: null, componentSetKey: null },
            code: { importPath: 'src/components/EvalColumns', export: 'EvalColumns' },
          },
        });
      // Positive: base grid → validates clean AND emits both track templates
      // (base repeat(2) + the enum-class override repeat(3)).
      const okc = mk({ display: 'grid', columns: 2 });
      const okErrs: string[] = [];
      coreValidateContract(okc, new Map([[okc.id, okc]]), okErrs, new Map());
      if (okErrs.length > 0) throw new Error(`grid + columns override must validate: ${okErrs.join('; ')}`);
      // CARRY-BOTH prouvé sur les TROIS émetteurs CSS, pas seulement react : la
      // revue de la spec 023 a montré que emit-html PUIS emit-react-inline avaient
      // chacun laissé tomber `columns` dans leur override de layout (recopie de
      // champs à la main). Un cas mono-surface ne l'attrape pas ; celui-ci teste la
      // sous-chaîne de piste commune aux trois sorties (`repeat(N, minmax(0, 1fr))`).
      const ctx = { tokens: new Set<string>(), icons: new Map(), contracts: new Map() };
      const inlineCtx = { tokens: { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } }, icons: new Map(), contracts: new Map(), mode: 'light' as const };
      const surfaces: Array<[string, string]> = [
        ['react', coreEmitReact(okc, ctx).css],
        ['html', coreEmitHtml(okc, ctx).css],
        ['react-inline', coreEmitReactInline(okc, inlineCtx).tsx],
      ];
      for (const [surface, out] of surfaces) {
        if (!out.includes('repeat(2, minmax(0, 1fr))')) throw new Error(`${surface}: base grid track template (2) missing`);
        if (!out.includes('repeat(3, minmax(0, 1fr))')) throw new Error(`${surface}: per-enum columns override track template (3) missing`);
      }
      // Negative: base non-grid → refused BY NAME (columns requires grid).
      const badc = mk({ display: 'flex', direction: 'column' });
      const badErrs: string[] = [];
      coreValidateContract(badc, new Map([[badc.id, badc]]), badErrs, new Map());
      if (!badErrs.some((e) => e.includes('sets columns but the part\'s base layout is not display:"grid"'))) {
        throw new Error(`columns override on non-grid part must refuse by name; got: ${badErrs.join('; ') || '(none)'}`);
      }
    },
  },
  {
    // COVERAGE ROUND workstream 4: the filed Phase B emitter bugs are dead
    // at the source — the emitted token script parses rgb()/rgba() verbatim
    // values (alpha preserved), the emitted shape branch carries stroke +
    // bindings and clears the default paint, and the Figma emitter binds the
    // `background` channel the HTML surface always carried (Avatar).
    id: 'rgba-stroke-emitter-fixes',
    claim: 'C1-determinism',
    run: () => {
      const tokensScript = readFileSync(path.join(ROOT, 'examples/polaris/figma/00-tokens.figma.js'), 'utf8');
      const m = tokensScript.match(/function hexToRgb[\s\S]*?\n\}/);
      if (!m) throw new Error('00-tokens.figma.js has no hexToRgb');
      const hexToRgb = new Function(`${m[0].replace('function hexToRgb', 'function __f')}; return __f;`)() as (
        v: string,
      ) => { r: number; g: number; b: number; a?: number };
      const rgba = hexToRgb('rgba(0, 0, 0, 0.71)');
      if (rgba.r !== 0 || rgba.a !== 0.71) throw new Error(`emitted parser must accept rgba(): ${JSON.stringify(rgba)}`);
      const rgb = hexToRgb('rgb(145, 208, 255)');
      if (Math.abs(rgb.g - 208 / 255) > 1e-9) throw new Error(`emitted parser must accept rgb(): ${JSON.stringify(rgb)}`);
      const hex = hexToRgb('#ff0000');
      if (hex.r !== 1 || hex.g !== 0) throw new Error(`emitted parser must still accept hex: ${JSON.stringify(hex)}`);
      // NaN channels (the Phase B live failure) are impossible for either spelling.
      for (const v of ['rgba(255, 255, 255, 1)', '#00000012']) {
        const c = hexToRgb(v);
        if ([c.r, c.g, c.b].some(Number.isNaN)) throw new Error(`NaN channel for ${v}`);
      }
      // Shape branch: stroke + bindings + default-paint clear (checkbox).
      const checkbox = readFileSync(path.join(ROOT, 'examples/polaris/figma/checkbox.figma.js'), 'utf8');
      const shapeBranch = checkbox.slice(checkbox.indexOf("spec.type === 'shape'"));
      const shapeBody = shapeBranch.slice(0, shapeBranch.indexOf('} else {'));
      if (!shapeBody.includes('spec.stroke')) throw new Error('shape branch must apply spec.stroke');
      if (!shapeBody.includes('spec.bindings')) throw new Error('shape branch must apply spec.bindings');
      // Round 5f (B5E finding 2): the shape branch applies a LITERAL fill
      // (spec.lits.fillColor — the RadioButton dot white) at source, and still
      // CLEARS the default gray paint when neither a bound fill nor a literal
      // fill is carried (the checkbox backdrop with only a stroke).
      if (!shapeBody.includes('spec.lits.fillColor')) {
        throw new Error('shape branch must apply the literal fill (lits.fillColor) — B5E finding 2 (radio dot white)');
      }
      if (!shapeBody.includes('[boundPaint(spec.fill, node)]') || !/:\s*\[\]/.test(shapeBody)) {
        throw new Error('shape branch must bind spec.fill and clear ([]) the default paint when no fill/literal is carried');
      }
      // Round 5f (B5E finding 3): applyInsetOverlay lowers ONLY childless
      // BACKDROP overlays to index 0; a CONTENT overlay (the check glyph) stays
      // ON TOP — else the opaque backdrop paints over the glyph (z-order fix at
      // source, not a per-session canvas correction).
      if (checkbox.includes('function applyInsetOverlay(')) {
        const io = checkbox.slice(checkbox.indexOf('function applyInsetOverlay('));
        const ioBody = io.slice(0, io.indexOf('\n}'));
        if (!/childNode\.children[\s\S]*length === 0[\s\S]*insertChild\(0/.test(ioBody)) {
          throw new Error('applyInsetOverlay must guard the index-0 lowering to CHILDLESS backdrops — a content overlay (check glyph) would be painted over by the backdrop (B5E finding 3)');
        }
      }
      // Cross-generator carry: Avatar's background binds on the canvas too.
      const avatarScript = readFileSync(path.join(ROOT, 'examples/polaris/figma/avatar.figma.js'), 'utf8');
      if (!avatarScript.includes('"fill": "p/color-avatar-one-bg-fill"')) {
        throw new Error('avatar figma script must bind the background fill the HTML surface carries');
      }
    },
  },
  {
    // S4 ROUND 1 (north-star push): the v15 channel lifts land on the CANVAS
    // emitter with the capability-matrix verdicts — per-corner radii and
    // per-side widths BIND (each field is variable-bindable), gradients parse
    // into native GRADIENT_LINEAR paints, shadow stacks (multi-layer + inset)
    // become native effect lists, the A22 text channels draw natively
    // (textCase/textDecoration/textAlignHorizontal/letterSpacing/fontFamily/
    // textTruncation), layout.wrap becomes layoutWrap 'WRAP', and every
    // 'annotate'-verdict declared fact lands as the matrix §b annotation copy
    // in the component description — declared-not-drawn, never dropped. The
    // CSS surfaces render the same facts verbatim.
    id: 's4-canvas-channel-lifts',
    claim: 'C1-determinism',
    run: () => {
      const fixture: any = {
        id: 's4.lifts',
        name: 'S4Lifts',
        version: '1.0.0',
        status: 'draft',
        description: 'S4 channel-lift eval fixture.',
        semantics: { element: 'button' },
        props: [
          { name: 'children', type: 'text', default: 'Lift', bindings: { figma: { kind: 'TEXT', property: 'Label' }, code: { prop: 'children' } } },
          { name: 'variant', type: { enum: ['a', 'b'] }, default: 'a', bindings: { figma: { kind: 'VARIANT', property: 'Variant' }, code: { prop: 'variant' } } },
        ],
        states: ['disabled'],
        anatomy: {
          root: {
            layout: { display: 'flex', wrap: true },
            tokens: {
              'border-top-left-radius': '{s4.radius-tl}',
              'border-top-width': '{s4.bw-top}',
              'border-color': '{s4.border}',
              'background-image': '{s4.grad}',
              'box-shadow': '{s4.shadow-stack}',
            },
            declared: { cursor: 'pointer', 'user-select': 'none', position: 'relative', 'z-index': '3' },
            declaredStates: { disabled: { cursor: 'pointer' } },
            parts: {
              label: {
                content: { prop: 'children' },
                tokens: { 'letter-spacing': '{s4.tracking}', 'font-family': '{s4.family}' },
                declared: {
                  'text-transform': 'uppercase',
                  'text-decoration-line': 'underline',
                  'text-align': 'center',
                  'text-overflow': 'ellipsis',
                },
              },
            },
          },
        },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/S4Lifts', export: 'S4Lifts' } },
      };
      const parsed = ContractSchema.parse(fixture); // v15 fields are schema vocabulary, not extensions
      const errs: string[] = [];
      coreValidateContract(parsed as any, new Map([[parsed.id, parsed as any]]), errs, new Map());
      if (errs.length > 0) throw new Error('fixture must validate: ' + errs.join('; '));
      // Grammar refusals stay refusals: position outside the relative class,
      // channels outside the registry, values outside the bounded grammar.
      // 2026-08-12: z-index GRADUATED into DECLARED_CHANNELS (numeric stacking
      // lowered to stable child order — schema note). The stale expectation
      // "z-index refuses as non-registry" is replaced by BOTH sides of the
      // new truth: a keyword refuses by the channel's bounded grammar, and a
      // numeric value lifts into the compiled spec (asserted below on `va`).
      const bad = structuredClone(fixture);
      bad.anatomy.root.declared.position = 'fixed';
      bad.anatomy.root.declared['z-index'] = 'auto';
      bad.anatomy.root.declared.float = 'left';
      const badErrs: string[] = [];
      coreValidateContract(bad, new Map([[bad.id, bad]]), badErrs, new Map());
      if (!badErrs.some((e) => e.includes('"position"') && e.includes('bounded grammar'))) {
        throw new Error('position: fixed must refuse by grammar; got: ' + badErrs.join('; '));
      }
      if (!badErrs.some((e) => e.includes('"z-index"') && e.includes('bounded grammar'))) {
        throw new Error('z-index: auto must refuse by the channel grammar; got: ' + badErrs.join('; '));
      }
      if (!badErrs.some((e) => e.includes('"float"') && e.includes('not a declared channel'))) {
        throw new Error('float must refuse as a non-registry channel; got: ' + badErrs.join('; '));
      }
      const engine = createFigmaEngine({
        tokens: {
          primitives: {
            s4: {
              'radius-tl': { $value: '4px', $type: 'dimension' },
              'bw-top': { $value: '2px', $type: 'dimension' },
              border: { $value: '#112233', $type: 'color' },
              grad: { $value: 'linear-gradient(180deg, #ff0000 0%, rgba(0, 0, 255, 0.5) 100%)', $type: 'gradient' },
              'shadow-stack': { $value: '0px 1px 2px 0px rgba(0, 0, 0, 0.5), inset 0px -1px 0px 1px #112233', $type: 'shadow' },
              tracking: { $value: '0.5px', $type: 'dimension' },
              family: { $value: '"Söhne", "Helvetica Neue", sans-serif', $type: 'fontFamily' },
            },
          },
          semantic: {}, light: {}, dark: {}, brands: { default: {} },
        },
        icons: new Map(),
      });
      const script = engine.buildComponentScript(parsed as any, new Map([[parsed.id, parsed as any]]));
      const comp = JSON.parse(script.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      const va = comp.variants[0].spec;
      if (va.bindings?.topLeftRadius !== 's4/radius-tl') throw new Error('per-corner radius must BIND topLeftRadius');
      if (va.bindings?.strokeTopWeight !== 's4/bw-top') throw new Error('per-side width must BIND strokeTopWeight');
      if (va.layout?.wrap !== true) throw new Error('layout.wrap must compile to LayoutSpec.wrap');
      if (va.zIndex !== 3) throw new Error('numeric z-index must lift into the compiled spec (declared channel), got ' + JSON.stringify(va.zIndex));
      if (va.gradient?.angle !== 180 || va.gradient.stops.length !== 2) throw new Error('gradient must parse angle + stops: ' + JSON.stringify(va.gradient));
      const stop2 = va.gradient.stops[1];
      if (stop2.position !== 1 || stop2.color.b !== 1 || stop2.color.a !== 0.5) throw new Error('gradient stop 2 must carry rgba + position: ' + JSON.stringify(stop2));
      if (va.effectStack?.length !== 2) throw new Error('shadow stack must parse BOTH layers: ' + JSON.stringify(va.effectStack));
      if (va.effectStack[1].inner !== true || va.effectStack[1].spread !== 1) throw new Error('inset layer must carry inner + spread: ' + JSON.stringify(va.effectStack[1]));
      const label = va.children[0];
      if (label.letterSpacing !== 0.5) throw new Error('letter-spacing must ride the text node (px literal)');
      if (label.textCase !== 'UPPER' || label.textDecoration !== 'UNDERLINE' || label.textAlignH !== 'CENTER') {
        throw new Error('declared text facts must DRAW: ' + JSON.stringify({ c: label.textCase, d: label.textDecoration, a: label.textAlignH }));
      }
      if (label.fontFamily !== 'Söhne') throw new Error('font-family must carry the first stack entry, got ' + label.fontFamily);
      if (label.textTruncation !== true) throw new Error('text-overflow: ellipsis must carry textTruncation');
      for (const marker of ["layoutWrap = 'WRAP'", 'INNER_SHADOW', 'GRADIENT_LINEAR', 'node.textCase = spec.textCase', 'node.fontName = await textFont(spec)']) {
        if (!script.includes(marker)) throw new Error('emitted runtime missing: ' + marker);
      }
      // ROUND 4 (owner de-noise directive): descriptions are ONE caption line
      // + a single trailing dagger when code-only facts exist — the
      // capability-matrix paragraphs live in repo receipts only. This pin
      // REPLACES the pre-round-4 assertion that annotation copy landed in the
      // description (the old behavior is retired, not broken).
      if (!/^S4Lifts — generated from contract s4\.lifts v1\.0\.0/.test(comp.description)) {
        throw new Error('description must be the one-line caption, got: ' + JSON.stringify(comp.description).slice(0, 120));
      }
      if (!comp.description.includes('†')) {
        throw new Error('a contract with code-only facts must carry the † footnote marker');
      }
      if (comp.description.includes('Cursor changes')) {
        throw new Error('de-noise regression: capability-matrix annotation copy leaked back into the description');
      }
      if (comp.description.split('\n').length > 2) {
        throw new Error('description must stay a single caption line (+ optional footnote), got ' + comp.description.split('\n').length + ' lines');
      }
      // CSS surfaces render the same facts verbatim (and the declared cursor
      // supersedes the emitter chrome — no invented not-allowed).
      const html = coreEmitHtml(parsed as any, {
        tokens: tokenInventoryFromJson([{ s4: { 'radius-tl': { $value: '4px', $type: 'dimension' } } }]),
        icons: new Map(),
        contracts: new Map([[parsed.id, parsed as any]]),
      });
      for (const rule of ['flex-wrap: wrap', 'cursor: pointer', 'text-transform: uppercase', 'text-decoration-line: underline', 'user-select: none']) {
        if (!html.css.includes(rule)) throw new Error('emit-html missing declared/wrap rule: ' + rule);
      }
      if (html.css.includes('not-allowed')) throw new Error('declared cursor must supersede the built-in :disabled not-allowed chrome');
    },
  },
  {
    // #60 — the four named canvas-emitter defects, each pinned; the fillClear
    // pin EXECUTES the emitted runtime (never just greps it).
    //   1. fillClear precedence: a spec-carried fill is never trampled
    //   2. per-component scripts are AMEND-CAPABLE (shared sync runtime)
    //   3. standalone COMPONENTs amend in place (amendComponent)
    //   4. empty-child runtime-sized geometry gets declared defaults (FILL)
    id: 'figma-60-canvas-emitter-fixes',
    claim: 'C1-determinism',
    run: () => {
      const fixture: any = {
        id: 's4.fillclear',
        name: 'FillClearFx',
        version: '1.0.0',
        status: 'draft',
        description: '#60 fillClear precedence fixture.',
        semantics: { element: 'div' },
        props: [
          { name: 'variant', type: { enum: ['a', 'b'] }, default: 'a', bindings: { figma: { kind: 'VARIANT', property: 'Variant' }, code: { prop: 'variant' } } },
        ],
        states: [],
        anatomy: {
          root: {
            tokensByProp: { prop: 'variant', map: { a: { background: '{fx.bg}' } } },
            literals: { background: 'transparent' },
          },
        },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/FillClearFx', export: 'FillClearFx' } },
      };
      const engine = createFigmaEngine({
        tokens: { primitives: { fx: { bg: { $value: '#301050', $type: 'color' } } }, semantic: {}, light: {}, dark: {}, brands: { default: {} } },
        icons: new Map(),
      });
      const script = engine.buildComponentScript(fixture, new Map([[fixture.id, fixture]]));
      const comp = JSON.parse(script.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      const specA = comp.variants.find((v: any) => v.name.includes('=a')).spec;
      const specB = comp.variants.find((v: any) => v.name.includes('=b')).spec;
      // (1) compile side: fill + fillClear on one spec = fill wins (fillClear
      // is not compiled at all); the fill-less variant keeps its clear.
      if (specA.fill !== 'fx/bg' || specA.lits?.fillClear) throw new Error('fix 1 (compile): fill variant must carry fill and NO fillClear: ' + JSON.stringify(specA.lits));
      if (specB.fill !== undefined || specB.lits?.fillClear !== true) throw new Error('fix 1 (compile): fill-less variant must keep fillClear');
      // (1) runtime side: EXECUTE the emitted applyFrameSpec against both
      // orders — a hand-fed spec carrying BOTH must keep its fill.
      const src = script.match(/function applyFrameSpec\(node, spec\) \{[\s\S]*?\n\}/)![0];
      const applyFrameSpec = (new Function('need', 'boundPaint', src + '; return applyFrameSpec;'))(
        () => ({}),
        () => 'BOUND-PAINT',
      ) as (node: any, spec: any) => void;
      const layout = { mode: 'HORIZONTAL', primary: 'MIN', counter: 'MIN' };
      const node1: any = { type: 'FRAME', setBoundVariable() {}, resize() {}, width: 0, height: 0 };
      applyFrameSpec(node1, { layout, fill: 'fx/bg', lits: { fillClear: true } });
      if (!Array.isArray(node1.fills) || node1.fills[0] !== 'BOUND-PAINT') {
        throw new Error('fix 1 (runtime): executed applyFrameSpec trampled the spec-carried fill: ' + JSON.stringify(node1.fills));
      }
      const node2: any = { type: 'FRAME', setBoundVariable() {}, resize() {}, width: 0, height: 0 };
      applyFrameSpec(node2, { layout, lits: { fillClear: true } });
      if (!Array.isArray(node2.fills) || node2.fills.length !== 0) {
        throw new Error('fix 1 (runtime): fill-less fillClear must clear: ' + JSON.stringify(node2.fills));
      }
      // (2) amend-capable per-component runtime — the create-only skip is gone.
      for (const marker of ['async function amendSet', 'async function syncOne']) {
        if (!script.includes(marker)) throw new Error('fix 2: per-component script missing ' + marker);
      }
      if (script.includes('return { skipped: true, nodeId: existing.id, key: existing.key };')) {
        throw new Error('fix 2: create-only skip path still emitted');
      }
      // (3) standalone amend — the v1 refusal is retired, amendComponent routes.
      if (!script.includes('async function amendComponent')) throw new Error('fix 3: amendComponent missing');
      if (script.includes("reason: 'standalone component — amend supports variant sets in v1'")) {
        throw new Error('fix 3: v1 standalone skip still emitted');
      }
      if (!script.includes("existing.type === 'COMPONENT' && !C.isSet")) throw new Error('fix 3: standalone routing missing');
      // (4) empty-child declared defaults in ALL THREE build paths (create,
      // set amend, standalone amend) — never Figma's 100×100 artifact.
      const fillFixCount = script.split("childNode.layoutSizingVertical = 'FILL'").length - 1;
      if (fillFixCount < 3) throw new Error('fix 4: empty-child FILL default missing from a build path (found ' + fillFixCount + '/3)');
      // The COMMITTED polaris artifacts carry the fixes at source: Badge is
      // the standalone class Phase B-2 had to delete+recreate; ProgressBar is
      // finding 4's indicator.
      const badge = readFileSync(path.join(ROOT, 'examples/polaris/figma/badge.figma.js'), 'utf8');
      if (!badge.includes('amendComponent')) throw new Error('committed badge script must be standalone-amend-capable');
      const pbar = readFileSync(path.join(ROOT, 'examples/polaris/figma/progress-bar.figma.js'), 'utf8');
      if (!pbar.includes("layoutSizingVertical = 'FILL'")) throw new Error('committed progress-bar script must carry the empty-child default');
      // Round 5c: Button's tone×variant re-mint gave EVERY variant a fill
      // binding, so its script no longer carries fillClear lits and the
      // feature-gated runtime drops that chunk (byte-stable by design). Tag
      // still carries transparent planes — its committed script carries the
      // runtime guard.
      const tagScript = readFileSync(path.join(ROOT, 'examples/polaris/figma/tag.figma.js'), 'utf8');
      if (!tagScript.includes('li.fillClear && !spec.fill')) throw new Error('committed tag script must carry the runtime fillClear guard');
    },
  },
  {
    // Re-running the showcase generation from the COMMITTED contracts +
    // token wrap is byte-stable (every generated/react, generated/html and
    // figma/ file re-emits identical), and the truth-table numbers quoted in
    // SHOWCASE.md byte-match receipts/truth-table.json — prose can never
    // drift from the measured data. Runs against the repo tree (read-only:
    // --check writes nothing); needs no Polaris clone and no network.
    id: 'polaris-showcase-reproducible',
    claim: 'C1-determinism',
    run: () => {
      const r = spawnSync(TSX, ['examples/polaris/generate.ts', '--check'], {
        cwd: ROOT,
        encoding: 'utf8',
      });
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      if ((r.status ?? -1) !== 0) throw new Error(`showcase --check failed:\n${out}`);
      if (!out.includes('byte-stable')) throw new Error(`missing byte-stability line:\n${out}`);
      if (!out.includes('truth-table rows match')) throw new Error(`missing truth-table consistency line:\n${out}`);
    },
  },
  {
    // COMPUTED FLOOR (extract/computed — the productionized capture spike):
    // the COMMITTED Button captured-truth fixture replays offline through
    // the shared replay implementation in real Chromium, and computed
    // re-read equality holds at the committed floor (no harness, no npm
    // sandbox, no network — the fixture IS the capture). Plus the §1.4
    // enumeration certificate: a synthetic ≥3-axis interaction is REFUSED BY
    // NAME under per-axis+pairwise policy, and the artifact set is
    // internally consistent (scorecard counts = numbers counts — the
    // prose-drift guard between receipts). Missing Chromium fails by name
    // (CERTIFICATION convention: `npx playwright install chromium` or
    // PLAYWRIGHT_CHROMIUM_PATH).
    id: 'computed-floor-gate',
    claim: 'C1-determinism',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import path from 'node:path';
        import { chromium } from 'playwright-core';
        import { chromiumExecutable } from './extract/figma/visual-parity/render.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { validateContract } from './core/emit-react.ts';
        import { enumerate, pairwiseCertificate } from './extract/computed/lib.ts';
        import { buildReplayHtml, reconstructCaptures, rereadEquality } from './extract/computed/replay.ts';

        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

        // 1) enumeration policy + the ≥3-axis certificate (pure)
        const axes = [
          { prop: 'a', values: ['a1', 'a2', 'a3', 'a4'] },
          { prop: 'b', values: ['b1', 'b2', 'b3', 'b4'] },
          { prop: 'c', values: ['c1', 'c2', 'c3', 'c4'] },
          { prop: 'd', values: ['d1', 'd2', 'd3', 'd4'] },
        ];
        const en = enumerate(axes, [], 100, { a: 'a1', b: 'b1', c: 'c1', d: 'd1' });
        if (en.policy !== 'per-axis+pairwise') throw new Error('256 > 100 must switch to per-axis+pairwise, got ' + en.policy);
        if (en.combos.length >= 256 || en.combos.length < 20) throw new Error('pairwise row count implausible: ' + en.combos.length);
        // planted ≥3-axis interaction: value depends on a AND b AND c jointly
        const threeAxis = en.combos.map((cm) => ({ axisValues: cm.axisValues, value: [cm.axisValues.a, cm.axisValues.b, cm.axisValues.c].join('+') }));
        const refusals = pairwiseCertificate(threeAxis, axes);
        if (refusals.length === 0 || !refusals[0].includes('pairwise-inconsistent')) {
          throw new Error('planted 3-axis interaction NOT refused by name: ' + JSON.stringify(refusals));
        }
        // a clean 2-axis function must pass the certificate
        const twoAxis = en.combos.map((cm) => ({ axisValues: cm.axisValues, value: [cm.axisValues.a, cm.axisValues.b].join('+') }));
        if (pairwiseCertificate(twoAxis, axes).length !== 0) throw new Error('2-axis function wrongly refused');

        // 2) committed artifact set: schema-valid + generator-valid enriched
        //    contract, and scorecard/numbers agree (receipts cannot drift)
        const dir = path.resolve('extract/computed/out/button');
        const truth = j(path.join(dir, 'captured-truth.json'));
        const enriched = ContractSchema.parse(j(path.join(dir, 'enriched.contract.json')));
        const errs = [];
        // round 4: promoted contracts may reference floor-reconstructed svg
        // assets — validate against the same merged icon map the floor used
        const icons = new Map();
        for (const iconDir of ['examples/polaris/assets/icons', path.join(dir, 'assets')]) {
          if (!fs.existsSync(iconDir)) continue;
          for (const f of fs.readdirSync(iconDir)) {
            if (f.endsWith('.svg')) icons.set(f.slice(0, -4), fs.readFileSync(path.join(iconDir, f), 'utf8').trim());
          }
        }
        validateContract(enriched, new Map([[enriched.id, enriched]]), errs, icons);
        if (errs.length) throw new Error('committed enriched contract fails validateContract: ' + errs[0]);
        const numbers = j(path.join(dir, 'numbers.json'));
        const scorecard = j(path.join(dir, 'scorecard.json'));
        for (const [a, b, what] of [
          [scorecard.fusion.contradictions, numbers.bound.contradictions, 'contradictions'],
          [scorecard.fusion.mintedLeaves, numbers.minted.leaves, 'minted leaves'],
          [scorecard.fusion.boundConfirmed, numbers.bound.confirmed, 'bound confirmed'],
        ]) { if (a !== b) throw new Error('scorecard/numbers drift on ' + what + ': ' + a + ' vs ' + b); }
        if (numbers.folds.mintedLeavesFolded >= numbers.folds.mintedLeavesUnfolded) {
          throw new Error('folding pass receipt implausible: folded ' + numbers.folds.mintedLeavesFolded + ' >= unfolded ' + numbers.folds.mintedLeavesUnfolded);
        }

        // 3) offline replay of the committed capture in real Chromium
        const captures = reconstructCaptures(truth);
        if (captures.length !== numbers.captures) throw new Error('reconstruction count ' + captures.length + ' != committed ' + numbers.captures);
        const specs = captures.map((c) => ({ key: c.combo + '__' + c.interaction, root: c.root }));
        const html = buildReplayHtml(specs, truth._provenance.stage, 'light');
        const tmp = path.join('evals', '.computed-replay.html');
        fs.writeFileSync(tmp, html);
        (async () => {
          const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
          try {
            const page = await browser.newPage();
            // The replay document is ~171 MB (4.06M computed cells inlined) and
            // measures ~12s to load on an IDLE machine — the 30s playwright
            // default flaked twice under full-suite load (2026-07-23). Timeout
            // sized to the measured fact, not to hope.
            await page.goto('file://' + path.resolve(tmp), { timeout: 120000 });
            await page.waitForFunction('window.__READY === true', undefined, { timeout: 120000 });
            await page.evaluate('document.fonts.ready');
            const reread = await rereadEquality((js) => page.evaluate(js), specs, truth._provenance.channels);
            if (reread.pct < 99.9) throw new Error('replay computed equality ' + reread.pct.toFixed(3) + '% below the 99.9% floor');
            if (reread.pct < numbers.replayComputedEquality.pct - 0.05) {
              throw new Error('replay equality regressed vs committed: ' + reread.pct.toFixed(3) + '% vs ' + numbers.replayComputedEquality.pct.toFixed(3) + '%');
            }
            console.log('computed-floor replay: ' + reread.cellsMatched + '/' + reread.cellsCompared + ' cells (' + reread.pct.toFixed(3) + '%) across ' + specs.length + ' captures');
          } finally { await browser.close(); fs.rmSync(tmp, { force: true }); }
        })().catch((e) => { console.error(e); process.exit(1); });
      `]);
      if (probe.status !== 0 || !probe.out.includes('computed-floor replay:')) {
        throw new Error(`computed-floor gate failed:\n${probe.out}`);
      }
    },
  },
  {
    // ROUND 4 — DOM-ANATOMY PROMOTION: the committed Banner contract carries
    // the anatomy the owner's reference shows — the tone RIBBON (an inner
    // box whose background rides a per-tone map), per-tone icon glyph parts
    // with committed svg assets, the dismiss button gated on the promoted
    // `dismissible` boolean, and the action row gated on `withAction`. The
    // emitted static HTML renders all of it (ribbon classes + inline svg).
    id: 'dom-anatomy-promotion',
    claim: 'C3-detection',
    run: () => {
      const j = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
      const banner = ContractSchema.parse(j('examples/polaris/contracts/banner.contract.json')) as SchemaContract;
      const parts: Array<[string, SchemaPart]> = [];
      const walk = (name: string, part: SchemaPart) => {
        parts.push([name, part]);
        for (const [n, c] of Object.entries(part.parts ?? {})) walk(n, c as SchemaPart);
      };
      for (const [n, c] of Object.entries(banner.anatomy)) walk(n, c as SchemaPart);
      // ribbon: a non-root part with a per-tone background-color map
      const ribbon = parts.find(([n, p]) => {
        if (n === 'root') return false;
        const tbp = p.tokensByProp;
        const entries = tbp ? (Array.isArray(tbp) ? tbp : [tbp]) : [];
        return entries.some((e) => e.prop === 'tone' && Object.values(e.map).some((m) => 'background-color' in m));
      });
      if (!ribbon) throw new Error('promoted Banner contract has NO tone-ribbon part (per-tone background-color map missing)');
      // per-tone glyph parts with committed assets
      const iconsDir = path.join(ROOT, 'examples/polaris/assets/icons');
      const glyphs = parts.filter(([, p]) => p.icon && p.visibleWhen?.prop === 'tone');
      if (glyphs.length < 4) throw new Error(`expected ≥4 per-tone icon glyph parts, found ${glyphs.length}`);
      for (const [n, p] of glyphs) {
        if (!existsSync(path.join(iconsDir, `${p.icon!.asset}.svg`))) {
          throw new Error(`glyph part "${n}" references missing asset ${p.icon!.asset}.svg`);
        }
      }
      // presence props + gated subtrees
      for (const propName of ['dismissible', 'withAction']) {
        const prop = banner.props.find((pr) => pr.name === propName);
        if (!prop || prop.type !== 'boolean') throw new Error(`promoted boolean prop "${propName}" missing`);
        const gated = parts.find(([, p]) => p.visibleWhen?.prop === propName);
        if (!gated) throw new Error(`no part gated on "${propName}"`);
      }
      const dismissBtn = parts.find(([, p]) => p.element === 'button' && p.visibleWhen?.prop === 'dismissible');
      if (!dismissBtn) throw new Error('dismiss button part (element button, visibleWhen dismissible) missing');
      // the emitted static HTML draws the ribbon + glyph svg
      const icons = new Map<string, string>();
      for (const f of readdirSync(iconsDir)) {
        if (f.endsWith('.svg')) icons.set(f.slice(0, -4), readFileSync(path.join(iconsDir, f), 'utf8').trim());
      }
      const tokens = tokenInventoryFromJson(
        ['examples/polaris/tokens/polaris.dtcg.json', 'examples/polaris/tokens/polaris-minted.dtcg.json']
          .filter((f) => existsSync(path.join(ROOT, f)))
          .map((f) => j(f)),
      );
      const clone = structuredClone(banner);
      for (const pr of clone.props) {
        if (pr.name === 'dismissible' || pr.name === 'withAction') pr.default = true;
      }
      const out = coreEmitHtml(clone, { tokens, icons, contracts: new Map([[clone.id, clone]]) });
      if (!out.html.includes('<svg')) throw new Error('emitted Banner HTML contains no inline svg glyph');
      if (!out.css.includes('background-color: var(--imported-banner-')) {
        throw new Error('emitted Banner CSS carries no minted ribbon background');
      }
      console.log(`dom-anatomy-promotion: ribbon "${ribbon[0]}", ${glyphs.length} tone glyphs, dismiss+action gated parts present; HTML renders inline svg`);
    },
  },
  {
    // ROUND 4 — SVG CONTENT ROUND TRIP: the committed captured truth's svg
    // subtree reconstructs BYTE-EQUAL to the committed icon asset (capture →
    // reconstructSvg → assets/icons), and the reconstructed markup carries
    // real path data that survives into the emitted HTML.
    id: 'svg-content-round-trip',
    claim: 'C1-determinism',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import path from 'node:path';
        import { reconstructCaptures } from './extract/computed/replay.ts';
        import { reconstructSvg } from './extract/computed/anatomy.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const truth = j('extract/computed/out/banner/captured-truth.json');
        const base = reconstructCaptures(truth)[0];
        // find the tone-icon svg element in the base tree
        let svgNode = null;
        const walk = (n) => {
          if (n.tag === 'svg' && !svgNode) { svgNode = n; return; }
          for (const c of n.nodes) if (c.t === 'el') walk(c.el);
        };
        walk(base.root);
        if (!svgNode) throw new Error('no svg element in the committed banner base capture');
        const receipts = [];
        // Round 5c: the pipeline prefers the currentColor spelling when the
        // svg's fill==color identity holds in EVERY combo (per-svg decision,
        // promoteAnatomy) — mirror it here from the base capture's styles.
        const identity = !!(svgNode.style && svgNode.style['fill'] && svgNode.style['fill'] === svgNode.style['color']);
        const r = reconstructSvg(svgNode, receipts, 'eval', identity);
        if (!r) throw new Error('reconstructSvg refused the committed banner glyph: ' + receipts.join('; '));
        if (!/^<svg viewBox="0 0 \\d+ \\d+"/.test(r.markup)) throw new Error('markup missing viewBox: ' + r.markup.slice(0, 60));
        if (!r.markup.includes('<path d="M')) throw new Error('markup missing path data');
        // the committed asset for the base tone (info) byte-matches
        const asset = fs.readFileSync('extract/computed/out/banner/assets/banner-icon-info.svg', 'utf8').trim();
        if (asset !== r.markup) throw new Error('committed asset differs from a fresh reconstruction:\\n' + asset.slice(0, 120) + '\\nvs\\n' + r.markup.slice(0, 120));
        console.log('svg round trip: ' + r.markup.length + ' bytes, viewBox reconstructed, byte-equal to the committed asset');
      `]);
      if (probe.status !== 0 || !probe.out.includes('svg round trip:')) {
        throw new Error(`svg round trip failed:\n${probe.out}`);
      }
    },
  },
  {
    // ROUND 4 — CANVAS PIXEL GATE receipts: the committed per-component
    // scorecards exist for the 10 pixel-scoped components, quote per-cell
    // masked numbers, keep the summary consistent with the rows (prose-drift
    // guard), and name a cause on every cell over 10%.
    id: 'canvas-pixel-gate-receipts',
    claim: 'C3-detection',
    run: () => {
      const dir = path.join(ROOT, 'examples/polaris/receipts/canvas-gate');
      const comps = ['button', 'badge', 'tag', 'banner', 'checkbox', 'radio-button', 'avatar', 'progress-bar', 'thumbnail', 'spinner'];
      for (const c of comps) {
        const f = path.join(dir, `${c}.scorecard.json`);
        if (!existsSync(f)) throw new Error(`missing canvas-gate scorecard: ${c}`);
        const sc = JSON.parse(readFileSync(f, 'utf8')) as {
          cells: Array<{ cell: string; pctAAMasked: number; note?: string }>;
          summary: { meanAAMasked: number; maxAAMasked: number };
          acceptance: { allCellsOver10Named: boolean };
        };
        if (!Array.isArray(sc.cells) || sc.cells.length === 0) throw new Error(`${c}: no cells scored`);
        // fully-masked cells score null (no scorable pixels) — excluded from
        // the mean on both sides of this consistency check.
        const scored = sc.cells.filter((r) => typeof r.pctAAMasked === 'number');
        if (scored.length === 0) throw new Error(`${c}: every cell fully masked — nothing scored`);
        const mean = scored.reduce((n, r) => n + (r.pctAAMasked as number), 0) / scored.length;
        if (Math.abs(mean - sc.summary.meanAAMasked) > 0.5) {
          throw new Error(`${c}: summary meanAAMasked ${sc.summary.meanAAMasked} drifts from rows (${mean.toFixed(3)})`);
        }
        if (!sc.acceptance.allCellsOver10Named) throw new Error(`${c}: cells over 10% without named causes`);
      }
      console.log(`canvas-pixel-gate: ${comps.length} scorecards present, summaries row-consistent, every >10% cell named`);
    },
  },
  {
    // PHASE 1 (@ds-contracts/cli) — the whole command surface, from a scratch
    // work dir the way a consumer would run it: build the bundled CLI, then
    // init → extract (the committed foreign-sibling fixture) → generate
    // (the committed Polaris Badge contract, react target + stories) →
    // figma (sync script) → diff (exit 0 clean, exit 1 on planted drift) →
    // propose-pr --dry-run (REST plan, no token, no network). Generation is
    // run TWICE and must be byte-stable.
    id: 'cli-smoke',
    claim: 'C7-cli',
    run: () => {
      const built = run(process.execPath, ['packages/cli/build.mjs']);
      if (built.status !== 0) throw new Error(`CLI build failed:\n${built.out}`);
      const cli = path.join(SCRATCH, 'packages', 'cli', 'dist', 'cli.js');
      const work = path.join(SCRATCH, 'cliwork');
      mkdirSync(work, { recursive: true });
      const runCli = (args: string[], cwd = work): RunResult => {
        const r = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
        return { status: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
      };

      // Committed inputs: the foreign-sibling extraction fixture rides the
      // scratch copy; the Polaris Badge contract + tokens + icons are
      // committed showcase artifacts copied in from the repo root.
      cpSync(path.join(SCRATCH, 'extract', 'fixtures', 'foreign-sibling'), path.join(work, 'lib'), { recursive: true });
      mkdirSync(path.join(work, 'polaris', 'contracts'), { recursive: true });
      cpSync(path.join(ROOT, 'examples', 'polaris', 'contracts', 'badge.contract.json'), path.join(work, 'polaris', 'contracts', 'badge.contract.json'));
      cpSync(path.join(ROOT, 'examples', 'polaris', 'tokens'), path.join(work, 'polaris', 'tokens'), { recursive: true });
      cpSync(path.join(ROOT, 'examples', 'polaris', 'assets', 'icons'), path.join(work, 'polaris', 'icons'), { recursive: true });

      // init: writes the config; a second init refuses by name.
      const init = runCli(['init']);
      if (init.status !== 0 || !existsSync(path.join(work, 'ds-contracts.config.json'))) {
        throw new Error(`init failed:\n${init.out}`);
      }
      const initAgain = runCli(['init']);
      if (initAgain.status !== 2 || !initAgain.out.includes('already exists')) {
        throw new Error(`second init must refuse by name (got ${initAgain.status}):\n${initAgain.out}`);
      }

      // extract over the committed foreign-sibling fixture.
      writeFileSync(
        path.join(work, 'extract.config.json'),
        JSON.stringify({ code: { adapter: 'react-tsx', root: 'lib' }, idPrefix: 'acme', out: 'out' }, null, 2),
      );
      const extract = runCli(['extract', 'extract.config.json']);
      if (extract.status !== 0 || !extract.out.includes('5 proposed contract(s)') || !extract.out.includes('2 component(s) seen but not extractable')) {
        throw new Error(`extract must propose 5 contracts and NAME the 2 skips:\n${extract.out}`);
      }

      // generate (react + stories) and figma, twice each — byte-stable.
      const tokens = 'polaris/tokens/polaris-light.dtcg.json,polaris/tokens/polaris-minted.dtcg.json';
      for (const dir of ['gen-a', 'gen-b']) {
        const g = runCli(['generate', 'polaris/contracts/badge.contract.json', '--out', `${dir}/react`, '--tokens', tokens, '--icons', 'polaris/icons', '--stories']);
        if (g.status !== 0) throw new Error(`generate failed (${dir}):\n${g.out}`);
        const f = runCli(['figma', 'polaris/contracts/badge.contract.json', '--out', `${dir}/figma`, '--tokens', tokens, '--icons', 'polaris/icons']);
        if (f.status !== 0) throw new Error(`figma failed (${dir}):\n${f.out}`);
      }
      for (const rel of ['react', 'figma']) {
        const a = hashTree(path.join('cliwork', 'gen-a', rel));
        const b = hashTree(path.join('cliwork', 'gen-b', rel));
        if (a !== b) throw new Error(`CLI ${rel} output is not byte-stable across two runs`);
      }
      for (const f of ['react/Badge/Badge.tsx', 'react/Badge/Badge.module.css', 'react/Badge/Badge.stories.tsx', 'react/Badge/index.ts', 'figma/badge.figma.js']) {
        if (!existsSync(path.join(work, 'gen-a', f))) throw new Error(`expected output missing: ${f}`);
      }

      // diff: clean on the fresh extraction (exit 0), then a planted code
      // prop drifts it (exit 1, [code AHEAD] named).
      const clean = runCli(['diff', 'extract.config.json']);
      if (clean.status !== 0 || !clean.out.includes('Diagnostic clean')) {
        throw new Error(`diff must exit 0 clean right after extraction:\n${clean.out}`);
      }
      const pill = path.join(work, 'lib', 'Pill.tsx');
      writeFileSync(pill, readFileSync(pill, 'utf8').replace('interface PillProps {', 'interface PillProps {\n  planted?: boolean;'));
      const drift = runCli(['diff', 'extract.config.json']);
      if (drift.status !== 1 || !drift.out.includes('[code AHEAD] Pill.planted')) {
        throw new Error(`diff must exit 1 naming the planted [code AHEAD] drift (got ${drift.status}):\n${drift.out}`);
      }

      // propose-pr --dry-run: the exact REST plan, zero token, zero network.
      const pr = runCli(['propose-pr', 'out/contracts/pill.contract.json', '--repo', 'acme/design-system', '--dry-run']);
      if (
        pr.status !== 0 ||
        !pr.out.includes('DRY RUN') ||
        !pr.out.includes('POST /repos/acme/design-system/pulls') ||
        !pr.out.includes('contents/contracts/pill.contract.json') ||
        !pr.out.includes('never persisted')
      ) {
        throw new Error(`propose-pr --dry-run must print the full REST plan without a token:\n${pr.out}`);
      }

      // extract --computed stays a LAZY, NAMED seam: the browser-dependent
      // runner is a separate chunk, never imported by the other verbs.
      if (!existsSync(path.join(SCRATCH, 'packages', 'cli', 'dist', 'computed.js'))) {
        throw new Error('dist/computed.js (the lazy browser chunk) was not built');
      }
      const cliBundle = readFileSync(cli, 'utf8');
      if (/from\s*["']playwright-core["']/.test(cliBundle)) {
        throw new Error('dist/cli.js must not import playwright-core statically — the lazy boundary is broken');
      }
      const noConfig = runCli(['extract', '--computed', '--config', 'missing.json']);
      if (noConfig.status !== 2 || !noConfig.out.includes('--config not found')) {
        throw new Error(`extract --computed must refuse a missing config by name:\n${noConfig.out}`);
      }

      console.log('cli-smoke: init → extract(5+2 named) → generate/figma byte-stable ×2 → diff 0/1 → propose-pr dry-run plan → lazy computed seam intact');
    },
  },
  {
    // PHASE 1 (@ds-contracts/cli) — propose-pr LIVE-PATH shape pin. The
    // dry-run plan is pinned above; this pins the two request shapes the live
    // GitHub path builds, which dry-run never exercised. A promotion normally
    // UPDATES a contract the target repo already carries, and PUT /contents
    // REFUSES to overwrite an existing blob without its current sha — the
    // first live run 422'd on exactly this ("\"sha\" wasn't supplied"). So
    // contentsPutBody must carry sha when the file exists (update) and omit it
    // when it doesn't (create); and the PR body must summarize the change in
    // plain words. All pure + offline — the actual PR open is a network+auth
    // receipt (examples/ci/PROPOSE-PR-LIVE.md), not an eval.
    id: 'propose-pr-live-shape',
    claim: 'C7-cli',
    run: () => {
      const { plan, content } = proposePrBuildPlan(
        path.join(ROOT, 'examples', 'polaris', 'contracts', 'badge.contract.json'),
        'tpitre/ds-contracts-pr-test',
        {},
      );

      // UPDATE: existing blob sha present → PUT body carries it verbatim.
      const upd = contentsPutBody(plan, content, 'abc123def456');
      if (upd.sha !== 'abc123def456') {
        throw new Error('contentsPutBody(update) must include the existing blob sha (else PUT /contents 422s on an existing contract)');
      }
      if (upd.branch !== plan.branch || upd.message !== plan.title) {
        throw new Error('contentsPutBody must commit to the proposal branch with the plan title');
      }
      if (Buffer.from(upd.content, 'base64').toString('utf8') !== content) {
        throw new Error('contentsPutBody must base64-encode the contract verbatim');
      }

      // CREATE: no existing sha → PUT body omits sha entirely (create path).
      const cre = contentsPutBody(plan, content, null);
      if ('sha' in cre) {
        throw new Error('contentsPutBody(create) must omit sha — sending an empty/absent sha on a fresh path is rejected');
      }

      // PR body carries a plain-words change summary read from the contract.
      const summary = proposePrSummarize(JSON.parse(content));
      if (!summary.includes('What changed') || !summary.includes('Badge')) {
        throw new Error(`propose-pr body must summarize the change in plain words:\n${summary}`);
      }
      if (!plan.body.includes('What changed')) {
        throw new Error('buildPlan body must embed the plain-words summary');
      }

      console.log('propose-pr-live-shape: PUT body carries sha on update, omits it on create, base64 verbatim; PR body summarizes the change (live open is a network receipt)');
    },
  },
  {
    // PHASE 1 (open emitter registry) — registerEmitter(): a foreign emitter
    // module registers, appears in getEmitters() AND the live `emitters`
    // array (the one every generic consumer iterates), name collisions and
    // shape errors refuse by name, and the CLI's --emitter flag loads the
    // same module so `generate --target test-emitter` emits its file.
    id: 'emitter-plugin-loads',
    claim: 'C7-cli',
    run: () => {
      const probe = run(TSX, ['-e', `
        import { emitters, emitterByName, getEmitters, registerEmitter } from './core/emitter.ts';
        import testEmitter from './evals/fixtures/test-emitter.mjs';
        const before = emitters.map((e) => e.name).join(',');
        if (before !== 'react,html,react-inline,figma-script') {
          throw new Error('built-in emitter order changed (load-bearing): ' + before);
        }
        registerEmitter(testEmitter);
        if (!getEmitters().some((e) => e.name === 'test-emitter')) throw new Error('not in getEmitters()');
        if (!emitters.some((e) => e.name === 'test-emitter')) throw new Error('registry array is not live — generic consumers would miss plugins');
        if (emitterByName.get('test-emitter') !== testEmitter) throw new Error('not in emitterByName');
        // Collisions and shape errors refuse by name — including the built-ins.
        for (const [bad, want] of [
          [testEmitter, 'already registered'],
          [{ name: 'react', label: 'x', emit: () => [] }, 'already registered'],
          [{ name: '', label: 'x', emit: () => [] }, 'non-empty string'],
          [{ name: 'no-emit', label: 'x' }, 'emit(contract, ctx) function'],
        ]) {
          let threw = '';
          try { registerEmitter(bad); } catch (e) { threw = String(e); }
          if (!threw.includes(want)) throw new Error('expected named refusal containing "' + want + '", got: ' + (threw || '(registered!)'));
        }
        console.log('registry probe ok: ' + getEmitters().map((e) => e.name).join(','));
      `]);
      if (probe.status !== 0 || !probe.out.includes('registry probe ok: react,html,react-inline,figma-script,test-emitter')) {
        throw new Error(`registry probe failed:\n${probe.out}`);
      }

      // The CLI loads the same module via --emitter and emits through it.
      const built = run(process.execPath, ['packages/cli/build.mjs']);
      if (built.status !== 0) throw new Error(`CLI build failed:\n${built.out}`);
      const cli = path.join(SCRATCH, 'packages', 'cli', 'dist', 'cli.js');
      const r = spawnSync(
        process.execPath,
        [cli, 'generate', path.join(ROOT, 'examples', 'polaris', 'contracts', 'badge.contract.json'),
          '--out', 'plugin-out', '--target', 'test-emitter',
          '--emitter', 'evals/fixtures/test-emitter.mjs',
          '--tokens', path.join(ROOT, 'examples', 'polaris', 'tokens', 'polaris-light.dtcg.json')],
        { cwd: SCRATCH, encoding: 'utf8' },
      );
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      if (r.status !== 0 || !out.includes('Registered emitter "test-emitter"')) {
        throw new Error(`CLI --emitter registration failed:\n${out}`);
      }
      const emitted = path.join(SCRATCH, 'plugin-out', 'badge.inventory.txt');
      if (!existsSync(emitted)) throw new Error('plugin emitter file not written');
      const contents = readFileSync(emitted, 'utf8');
      if (!contents.startsWith('polaris.badge@') || !contents.includes('props: tone, progress')) {
        throw new Error(`plugin emitter output wrong:\n${contents}`);
      }
      console.log('emitter-plugin-loads: registered (live array + getEmitters + byName), 4 named refusals, CLI --emitter emitted badge.inventory.txt');
    },
  },
  {
    // ROUND 5d — CANVAS GATE STANDING PIN (pin move RE-EARNED by the 5d
    // harnessed gate run, 2026-07-20, Chromium 148.0.7778.96 pin): the
    // owner's four visual defects are fixed at source — continuous check
    // glyph (dash animation vehicles dropped), control↔label gap as bound
    // itemSpacing + margin-box runtime, focus outline as an OUTSIDE-aligned
    // stroke (full-pair rule: a lone outline-color state recolor stays
    // inert, like CSS), all four Badge corners on {p.border-radius-200}.
    // Banner 4.60→3.17 (ring wraps the ribbon), Button 7.02→6.46 (5 focus
    // cells improved; SAME 53-cell named >10% membership as 5c), Tag
    // 29.97→22.55 (OUTSIDE ring on the two named preview cells), Checkbox
    // 3.06→3.22 (checked-cell raster of the continuous 2px stroke — the
    // capsule class is retired, named). SEVEN components PASS the ≤5%
    // masked-mean acceptance; every other component's mean is pinned, its
    // >10% cells all carry named causes (font raster / runtime-% /
    // outline→stroke previews / S3 state×tone residue), and a silent
    // regression (any mean drifting UP past its pin) fails this eval by
    // name. Re-earning the numbers needs the harnessed gate run
    // (extract/figma/canvas-gate/run.ts); this pin guards the committed
    // receipts between runs.
    id: 'canvas-gate-standing-pin',
    claim: 'C3-detection',
    run: () => {
      const dir = path.join(ROOT, 'examples/polaris/receipts/canvas-gate');
      // meanAAMasked pinned per component (round-5d final run, 2026-07-20,
      // Chromium 148.0.7778.96).
      const PIN: Record<string, { mean: number; accept: boolean }> = {
        avatar: { mean: 0, accept: true },
        badge: { mean: 0.07, accept: true },
        banner: { mean: 3.17, accept: true },
        // Button's mean is dominated by the 46 fully-masked text-only cells
        // (named font-raster class) + 5 focus-ring + 2 state×tone S3 cells.
        button: { mean: 6.46, accept: false },
        checkbox: { mean: 3.22, accept: true },
        'progress-bar': { mean: 26.22, accept: false },
        'radio-button': { mean: 0, accept: true },
        spinner: { mean: 0, accept: true },
        // Tag base + disabled are EXACT (0.00) on BOTH sizes; the mean is the
        // FOUR named active/focus state-preview cells (C5 outline
        // approximation). Round 5f: the defaultless `size` enum only carried
        // its 'large' set-value, so every Tag was forced large — materializing
        // the unset value added the PLAIN medium tag (Size=none base + disabled
        // both EXACT 0.00) and, with it, the medium size's two state-preview
        // cells of the SAME named class. Pin lifted 22.55→27.04 for the added
        // (smaller-box, so higher-%) medium state-preview cells; the set
        // changed shape (4→8 cells) — documented, same named residue.
        tag: { mean: 27.04, accept: false },
        thumbnail: { mean: 2.16, accept: true },
      };
      // Pixel-scoring nondeterminism headroom (AA classifier at 2x DSF):
      // observed byte-stable across consecutive runs; 0.75pp guards against
      // font-rasterization jitter without hiding a real regression.
      const TOL = 0.75;
      for (const [comp, pin] of Object.entries(PIN)) {
        const sc = JSON.parse(readFileSync(path.join(dir, `${comp}.scorecard.json`), 'utf8')) as {
          summary: { meanAAMasked: number };
          acceptance: { maskedMeanLE5: boolean; allCellsOver10Named: boolean; noBlankCanvasCells: boolean };
        };
        if (sc.summary.meanAAMasked > pin.mean + TOL) {
          throw new Error(`${comp}: masked mean ${sc.summary.meanAAMasked}% regressed past the round-5 pin ${pin.mean}%`);
        }
        if (!sc.acceptance.allCellsOver10Named) throw new Error(`${comp}: unnamed >10% cells`);
        const accepted = sc.acceptance.maskedMeanLE5 && sc.acceptance.noBlankCanvasCells;
        if (pin.accept && !accepted) {
          throw new Error(`${comp}: round-5 PASSING component no longer passes (mean≤5 ∧ noBlank)`);
        }
      }
      console.log('canvas-gate-standing-pin: 7/10 PASS pinned (Avatar, Badge, Banner, Checkbox, RadioButton, Spinner, Thumbnail); 10/10 means at or under their round-5d pins, all >10% cells named');
    },
  },
  {
    // PHASE 4 (Two Journeys) — J-ENGINEER standing gate. Figma is truth: the
    // committed CBDS plugin dump (the owner's live Button-Brand Primary send)
    // replays through the REAL propose path (proposeBatchFromDump — the same
    // function the playground receive path runs), the proposed contract plus
    // the captured/minted token layers land in the committed Storybook
    // skeleton (evals/fixtures/storybook-skeleton), the LOCAL packages/cli
    // build (the published CLI's exact source — network-free) generates
    // React + stories from the manifest command line
    // (evals/fixtures/journey-commands.json — the docs render the SAME file,
    // so documented and tested commands cannot diverge), and the emitted
    // story module renders in the real-browser harness with computed-style
    // spot checks against the committed Figma ground truth (the
    // cbds-bridge-check receipt numbers: #0e61ba background, #fcfeff label,
    // 48px height, 44px min-height tap target, 16px→12px padding-inline and
    // 48px→32px height across the size axis, 8px radius). Full Storybook is
    // deliberately NOT run (package install/network, tens of seconds); the
    // eval instead asserts the emitted stories land inside the committed
    // main.ts glob and renders the story module itself
    // (evals/fixtures/journey-engineer.entry.tsx, esbuild-bundled).
    id: 'journey-engineer',
    claim: 'C8-journey',
    run: () => {
      // The manifest is the ONLY place this eval's CLI command line lives.
      const manifest = JSON.parse(
        readFileSync(path.join(SCRATCH, 'evals', 'fixtures', 'journey-commands.json'), 'utf8'),
      ) as { cliPrefix: string; journeys: Record<string, { steps: Array<{ id: string; command: string }> }> };
      const argvOf = (journey: string, stepId: string): string[] => {
        const step = manifest.journeys[journey]?.steps.find((s) => s.id === stepId);
        if (!step) throw new Error(`journey-commands.json: missing step ${journey}/${stepId}`);
        const prefix = `${manifest.cliPrefix} `;
        if (!step.command.startsWith(prefix)) {
          throw new Error(`manifest command must start with "${prefix}": ${step.command}`);
        }
        return step.command.slice(prefix.length).split(/\s+/);
      };

      // 1. Replay the committed dump through the real propose path and lay
      //    the engineer's repo out in the committed Storybook skeleton.
      const setup = run(TSX, ['-e', `
        import fs from 'node:fs';
        import path from 'node:path';
        import { loadTokenCorpus } from './extract/figma/tokens.ts';
        import { loadContracts } from './extract/figma/propose.ts';
        import { proposeBatchFromDump } from './core/propose-figma.ts';
        import { capturedTokensFromDump } from './core/captured-tokens.ts';
        import { flattenTokens } from './core/tokens.ts';
        const WORK = 'jwork';
        const dump = JSON.parse(fs.readFileSync('extract/figma/fixtures/cbds-plugin-button-brand-primary.dump.json', 'utf8'));
        const loaded = loadContracts(path.resolve('contracts'));
        const batch = proposeBatchFromDump(dump, { corpus: loadTokenCorpus(process.cwd()), contractIdByName: loaded.byName, contractsById: loaded.byId, fileKey: 'WofZT8xaxXuc2Q6Je9S4XE', mintUnbound: true });
        if (batch.proposals.length !== 1 || batch.skipped.length !== 0) throw new Error('dump replay must propose exactly 1 with 0 skips (got ' + batch.proposals.length + '/' + batch.skipped.length + ')');
        const proposal = batch.proposals[0];
        const c = proposal.contract;
        if (c.name !== 'ButtonBrandPrimary') throw new Error('unexpected proposal name: ' + c.name);
        fs.cpSync('evals/fixtures/storybook-skeleton', WORK, { recursive: true });
        fs.mkdirSync(path.join(WORK, 'contracts'), { recursive: true });
        fs.writeFileSync(path.join(WORK, 'contracts', 'button-brand-primary.contract.json'), JSON.stringify(c, null, 2) + '\\n');
        for (const s of proposal.childStubs ?? []) {
          fs.writeFileSync(path.join(WORK, 'contracts', s.id.split('.').pop() + '.contract.json'), JSON.stringify(s, null, 2) + '\\n');
        }
        const captured = capturedTokensFromDump(dump);
        if (!captured || captured.count !== 18) throw new Error('captured layer must carry the 18 dump variables (got ' + (captured && captured.count) + ')');
        fs.mkdirSync(path.join(WORK, 'tokens'), { recursive: true });
        fs.writeFileSync(path.join(WORK, 'tokens', 'captured.dtcg.json'), JSON.stringify(captured.tree, null, 2) + '\\n');
        fs.writeFileSync(path.join(WORK, 'tokens', 'minted.dtcg.json'), JSON.stringify((proposal.mintedTokens && proposal.mintedTokens.tree) || {}, null, 2) + '\\n');
        // The consumer's token build: captured + minted values as CSS custom
        // properties (token dots -> hyphens, the generateCss naming rule).
        const vars = [];
        for (const e of captured.entries) vars.push('  --' + e.path.split('.').join('-') + ': ' + e.value + ';');
        for (const [p, entry] of flattenTokens((proposal.mintedTokens && proposal.mintedTokens.tree) || {})) vars.push('  --' + p.split('.').join('-') + ': ' + entry.value + ';');
        fs.writeFileSync(path.join(WORK, 'src', 'tokens.css'), ':root {\\n' + vars.join('\\n') + '\\n}\\n');
        console.log('setup ok: contract + ' + ((proposal.childStubs || []).length) + ' stub(s), ' + vars.length + ' css vars');
      `]);
      if (setup.status !== 0 || !setup.out.includes('setup ok:')) {
        throw new Error(`dump replay / skeleton setup failed:\n${setup.out}`);
      }

      // 2. The manifest command, executed by the LOCAL CLI build in the
      //    engineer's repo (published-CLI-equivalent; the published bundle is
      //    npx-verified separately in examples/ci/VALIDATION.md).
      const built = run(process.execPath, ['packages/cli/build.mjs']);
      if (built.status !== 0) throw new Error(`CLI build failed:\n${built.out}`);
      const cli = path.join(SCRATCH, 'packages', 'cli', 'dist', 'cli.js');
      const jwork = path.join(SCRATCH, 'jwork');
      const gen = spawnSync(process.execPath, [cli, ...argvOf('engineer', 'generate-stories')], {
        cwd: jwork,
        encoding: 'utf8',
      });
      const genOut = `${gen.stdout ?? ''}${gen.stderr ?? ''}`;
      if ((gen.status ?? -1) !== 0 || !genOut.includes('ButtonBrandPrimary')) {
        throw new Error(`manifest generate command failed:\n${genOut}`);
      }

      // 3. Glob conformance: the emitted story file sits inside the
      //    committed skeleton's main.ts stories glob — a real
      //    `npm run storybook` over this exact layout picks it up.
      const mainTs = readFileSync(path.join(jwork, '.storybook', 'main.ts'), 'utf8');
      if (!mainTs.includes("stories: ['../src/generated/**/*.stories.@(ts|tsx)']")) {
        throw new Error('storybook-skeleton main.ts glob changed — update this eval AND the layout docs together');
      }
      const storyFile = path.join(jwork, 'src', 'generated', 'ButtonBrandPrimary', 'ButtonBrandPrimary.stories.tsx');
      if (!existsSync(storyFile)) {
        throw new Error('emitted story missing from the skeleton glob target: src/generated/ButtonBrandPrimary/ButtonBrandPrimary.stories.tsx');
      }

      // 4. Render the story module in the real browser; computed styles must
      //    equal the committed Figma ground truth (bridge receipt numbers).
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { build } from 'esbuild';
        import { chromium } from 'playwright-core';
        import { chromiumExecutable } from './extract/figma/visual-parity/render.ts';
        (async () => {
          fs.copyFileSync('evals/fixtures/journey-engineer.entry.tsx', 'jwork/__eval-entry.tsx');
          await build({ entryPoints: ['jwork/__eval-entry.tsx'], bundle: true, outfile: 'jwork/__eval-bundle/entry.js', format: 'iife', platform: 'browser', jsx: 'automatic', logLevel: 'silent' });
          const doc = '<!doctype html><html><head><meta charset="utf-8"><style>' + fs.readFileSync('jwork/src/tokens.css', 'utf8') + '</style><style>' + fs.readFileSync('jwork/__eval-bundle/entry.css', 'utf8') + '</style></head><body><div id="root-default"></div><div id="root-small"></div><script>' + fs.readFileSync('jwork/__eval-bundle/entry.js', 'utf8') + '</script></body></html>';
          const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
          try {
            const page = await browser.newPage();
            page.on('pageerror', (e) => { console.error('pageerror: ' + String(e)); process.exitCode = 1; });
            await page.setContent(doc, { waitUntil: 'load' });
            await page.waitForSelector('#root-default button', { timeout: 15000 });
            await page.waitForSelector('#root-small button', { timeout: 15000 });
            const r = await page.evaluate("(() => { const btn = document.querySelector('#root-default button'); const cs = getComputedStyle(btn); const label = Array.from(btn.querySelectorAll('span')).find((n) => n.textContent.trim() === 'Button'); const small = document.querySelector('#root-small button'); const scs = getComputedStyle(small); return { csf: window.__CSF__, text: btn.textContent.trim(), bg: cs.backgroundColor, height: cs.height, minHeight: cs.minHeight, padLeft: cs.paddingLeft, padRight: cs.paddingRight, padTop: cs.paddingTop, radius: cs.borderRadius, labelColor: label ? getComputedStyle(label).color : null, smallHeight: scs.height, smallPadLeft: scs.paddingLeft }; })()");
            // Ground truth = the committed dump's numbers, receipted in
            // extract/figma/cbds-bridge-check.ts (npm run extract:figma:cbds:bridge:check).
            const expect = {
              text: 'Button',
              bg: 'rgb(14, 97, 186)',        // {bg.brand.default} #0e61ba
              labelColor: 'rgb(252, 254, 255)', // {text.inverse-primary} #fcfeff on the label part
              height: '48px',                 // {component-size.xlarge} (size=large default)
              minHeight: '44px',              // minted tap-target literal
              padLeft: '16px', padRight: '16px', // {spacing.200}
              padTop: '8px',                  // {spacing.100} padding-block
              radius: '8px',                  // {corner-radius.100}
              smallHeight: '44px',            // size=small height token is 32px ({component-size.medium},
                                              // tokensByProp) but the carried 44px min-height tap target
                                              // clamps the rendered box — the same clamp the canvas shows
              smallPadLeft: '12px',           // tokensByProp size=small -> {spacing.150}
            };
            const bad = Object.entries(expect).filter(([k, v]) => r[k] !== v);
            if (bad.length > 0) throw new Error('computed-style drift vs Figma ground truth: ' + bad.map(([k, v]) => k + ' expected ' + v + ' got ' + r[k]).join('; '));
            if (!r.csf || r.csf.title !== 'Components/ButtonBrandPrimary') throw new Error('CSF meta title wrong: ' + JSON.stringify(r.csf));
            if (!r.csf.stories.includes('Playground') || r.csf.stories.length < 4) throw new Error('CSF stories missing: ' + JSON.stringify(r.csf.stories));
            console.log('journey-engineer render ok: ' + r.csf.stories.length + ' stories, all ' + Object.keys(expect).length + ' computed spot checks equal the dump truth');
          } finally { await browser.close(); }
        })().catch((e) => { console.error(e); process.exit(1); });
      `]);
      if (probe.status !== 0 || !probe.out.includes('journey-engineer render ok:')) {
        throw new Error(`story render probe failed:\n${probe.out}`);
      }
      console.log('journey-engineer: dump → propose (1/0) → manifest generate (local CLI build) → skeleton glob hit → browser render matches the 11-point Figma ground truth');
    },
  },
  {
    // PHASE 4 (Two Journeys) — J-DESIGNER standing gate. Code is truth: the
    // committed Polaris Badge contract (the showcase artifact) compiles to a
    // Figma sync script through the LOCAL CLI build using the manifest
    // command line (evals/fixtures/journey-commands.json — the docs-drift
    // guard seam, same file the docs render), the emitted script's compiled
    // COMPONENTS payload (createFigmaEngine's build product — the
    // emitters-check/canvas pattern, headless) is asserted on variant counts
    // and spot-checked bound values, and the `figma push` leg runs DRY: the
    // CONTRACTS-BUNDLE the CLI would post (toBundle — the exact function the
    // push verb runs) travels through the REAL worker pipeline
    // (workers/assist handleRequest over a Map-backed KV, fetchImpl throws —
    // zero network) and must arrive byte-identical, kind-tagged,
    // deliver-once; a malformed envelope must refuse by name. The live HTTP
    // transport itself is pinned by workers/assist/test/bridge.test.ts.
    id: 'journey-designer',
    claim: 'C8-journey',
    run: () => {
      const manifest = JSON.parse(
        readFileSync(path.join(SCRATCH, 'evals', 'fixtures', 'journey-commands.json'), 'utf8'),
      ) as { cliPrefix: string; journeys: Record<string, { steps: Array<{ id: string; command: string }> }> };
      const argvOf = (journey: string, stepId: string): string[] => {
        const step = manifest.journeys[journey]?.steps.find((s) => s.id === stepId);
        if (!step) throw new Error(`journey-commands.json: missing step ${journey}/${stepId}`);
        const prefix = `${manifest.cliPrefix} `;
        if (!step.command.startsWith(prefix)) {
          throw new Error(`manifest command must start with "${prefix}": ${step.command}`);
        }
        return step.command.slice(prefix.length).split(/\s+/);
      };

      // The designer-side repo: committed showcase artifacts, laid out the
      // way the manifest commands expect (same inputs as cli-smoke).
      const work = path.join(SCRATCH, 'jd-work');
      mkdirSync(path.join(work, 'contracts'), { recursive: true });
      mkdirSync(path.join(work, 'tokens'), { recursive: true });
      cpSync(path.join(ROOT, 'examples', 'polaris', 'contracts', 'badge.contract.json'), path.join(work, 'contracts', 'badge.contract.json'));
      for (const t of ['polaris-light.dtcg.json', 'polaris-minted.dtcg.json']) {
        cpSync(path.join(ROOT, 'examples', 'polaris', 'tokens', t), path.join(work, 'tokens', t));
      }
      cpSync(path.join(ROOT, 'examples', 'polaris', 'assets', 'icons'), path.join(work, 'icons'), { recursive: true });

      // 1. figma-emit: the manifest command through the local CLI build.
      const built = run(process.execPath, ['packages/cli/build.mjs']);
      if (built.status !== 0) throw new Error(`CLI build failed:\n${built.out}`);
      const cli = path.join(SCRATCH, 'packages', 'cli', 'dist', 'cli.js');
      const emit = spawnSync(process.execPath, [cli, ...argvOf('designer', 'figma-emit')], { cwd: work, encoding: 'utf8' });
      const emitOut = `${emit.stdout ?? ''}${emit.stderr ?? ''}`;
      if ((emit.status ?? -1) !== 0 || !emitOut.includes('badge.figma.js')) {
        throw new Error(`manifest figma-emit command failed:\n${emitOut}`);
      }

      // 2. Headless canvas-engine compile: the sync script's COMPONENTS
      //    payload IS createFigmaEngine's compiled build product — variant
      //    counts and bound values, asserted against the contract's axes.
      const comp = parseSyncComponent(readFileSync(path.join(work, 'figma-sync', 'badge.figma.js'), 'utf8'));
      if (comp.setName !== 'Badge' || comp.contractId !== 'polaris.badge' || comp.isSet !== true) {
        throw new Error(`compiled set identity wrong: ${JSON.stringify({ setName: comp.setName, contractId: comp.contractId, isSet: comp.isSet })}`);
      }
      // Round 5f — OPTIONAL-ADORNMENT: `progress` is a defaultless enum that
      // gates the status pip; its unset value 'none' is materialized as the
      // DEFAULT, so the set is 14 tones × 4 progress (none|incomplete|
      // partiallyComplete|complete) = 56, and the DEFAULT variant is the PLAIN
      // (no-pip) badge.
      if (comp.variants.length !== 56) throw new Error(`Badge must compile 14 tones × 4 progress (incl. the plain 'none') = 56 variants, got ${comp.variants.length}`);
      const tones = new Set<string>();
      const progresses = new Set<string>();
      for (const v of comp.variants) {
        const m = /^Tone=([^,]+), Progress=(.+)$/.exec(v.name);
        if (!m) throw new Error(`variant name grammar broke: ${v.name}`);
        tones.add(m[1]);
        progresses.add(m[2]);
      }
      if (tones.size !== 14 || progresses.size !== 4 || !progresses.has('none')) {
        throw new Error(`variant grid wrong: ${tones.size} tones × ${progresses.size} progress values (must include 'none')`);
      }
      // Spot checks: per-tone fill substitution + literal token bindings
      // (variable names use SLASHES on the canvas — the emitter's mapping).
      const v0 = comp.variants[0];
      if (v0.name !== 'Tone=info, Progress=none') throw new Error(`default combo must be the PLAIN Progress=none badge and compile first, got ${v0.name}`);
      if (v0.spec.fill !== 'imported/badge/root/background-color/info') {
        throw new Error(`tone-substituted fill binding wrong on v0: ${v0.spec.fill}`);
      }
      const success = comp.variants.find((v: { name: string }) => v.name === 'Tone=success, Progress=complete');
      if (!success || success.spec.fill !== 'imported/badge/root/background-color/success') {
        throw new Error(`tone-substituted fill binding wrong on success: ${success?.spec.fill}`);
      }
      if (v0.spec.bindings?.topLeftRadius !== 'p/border-radius-200' || v0.spec.bindings?.paddingLeft !== 'p/space-200') {
        throw new Error(`literal token bindings wrong: ${JSON.stringify(v0.spec.bindings)}`);
      }
      // The PLAIN default variant draws NO pip (adornment absent); a
      // Progress=set variant DOES (the optional-adornment gate).
      const v0Kinds = (v0.spec.children ?? []).map((ch: { type: string; name: string }) => `${ch.type}:${ch.name}`);
      if (v0Kinds.some((k: string) => k.endsWith(':icon'))) throw new Error(`plain default variant DREW the pip: ${v0Kinds.join(', ')}`);
      if (!v0Kinds.includes('text:label')) throw new Error(`compiled anatomy children wrong: ${v0Kinds.join(', ')}`);
      const withPip = comp.variants.find((v: { name: string }) => v.name === 'Tone=info, Progress=incomplete')!;
      const pipKinds = (withPip.spec.children ?? []).map((ch: { type: string; name: string }) => `${ch.type}:${ch.name}`);
      if (!pipKinds.includes('frame:icon')) throw new Error(`Progress=incomplete variant lost the pip: ${pipKinds.join(', ')}`);

      // 3. figma push, DRY: the code-led CI artifact shape, the CLI's own
      //    toBundle, the REAL worker pipeline in-process — no network.
      const badge = JSON.parse(readFileSync(path.join(work, 'contracts', 'badge.contract.json'), 'utf8'));
      writeFileSync(
        path.join(work, 'contracts-bundle.json'),
        JSON.stringify({ type: 'CONTRACTS-BUNDLE', version: 1, contracts: [badge] }, null, 2) + '\n',
      );
      const pushArgv = argvOf('designer', 'figma-push');
      if (pushArgv[0] !== 'figma' || pushArgv[1] !== 'push' || pushArgv[2] !== 'contracts-bundle.json' || pushArgv[3] !== '--code' || pushArgv[4] !== '<CODE>') {
        throw new Error(`manifest figma-push command shape changed: ${pushArgv.join(' ')}`);
      }
      const push = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { handleRequest } from './workers/assist/src/index.ts';
        import { toBundle, CONTRACTS_BUNDLE_TYPE } from './packages/cli/src/commands/figma.ts';
        (async () => {
          const bundle = toBundle('jd-work/contracts-bundle.json');
          if (bundle.type !== CONTRACTS_BUNDLE_TYPE || bundle.version !== 1 || bundle.contracts.length !== 1) throw new Error('toBundle envelope wrong: ' + JSON.stringify({ type: bundle.type, version: bundle.version, n: bundle.contracts.length }));
          const store = new Map();
          const env = { ANTHROPIC_API_KEY: 'x', ASSIST_KV: { get: async (k) => (store.has(k) ? store.get(k) : null), put: async (k, v) => { store.set(k, v); }, delete: async (k) => { store.delete(k); } }, ASSIST_ENABLED: 'true', BRIDGE_ENABLED: 'true' };
          const deps = { fetchImpl: () => { throw new Error('bridge routes must not fetch'); }, now: () => new Date() };
          const req = (p, o) => { o = o || {}; const h = new Headers(); if (o.origin !== null) h.set('origin', o.origin || 'https://ds-contracts-playground.pages.dev'); h.set('cf-connecting-ip', '203.0.113.7'); const m = o.method || 'POST'; return new Request('https://assist.example' + p, { method: m, headers: h, body: m === 'GET' ? undefined : (o.body || '{}') }); };
          const created = await handleRequest(req('/bridge/session'), env, deps);
          if (created.status !== 200) throw new Error('session mint failed: ' + created.status);
          const code = (await created.json()).code;
          // The push body, exactly as the CLI posts it: no Origin header.
          const sent = await handleRequest(req('/bridge/' + code, { origin: null, body: JSON.stringify(bundle) }), env, deps);
          const sentBody = await sent.json();
          if (sent.status !== 200 || sentBody.ok !== true) throw new Error('bridge refused the push: ' + sent.status + ' ' + JSON.stringify(sentBody));
          if (store.get('bridge:kind:' + code) !== 'contracts-bundle') throw new Error('payload kind not recorded as contracts-bundle');
          const delivered = await handleRequest(req('/bridge/' + code, { method: 'GET' }), env, deps);
          const body = await delivered.json();
          if (body.status !== 'delivered' || body.kind !== 'contracts-bundle') throw new Error('delivery wrong: ' + JSON.stringify(body).slice(0, 200));
          if (JSON.stringify(body.dump) !== JSON.stringify(bundle)) throw new Error('bundle not byte-identical through the bridge');
          if (body.dump.contracts[0].id !== 'polaris.badge') throw new Error('wrong contract delivered: ' + body.dump.contracts[0].id);
          if (store.has('bridge:dump:' + code) || store.has('bridge:sess:' + code)) throw new Error('deliver-once keys not deleted after delivery');
          // Referee: a malformed envelope refuses BY NAME (the bridge schema).
          const s2 = await handleRequest(req('/bridge/session'), env, deps);
          const code2 = (await s2.json()).code;
          const refused = await handleRequest(req('/bridge/' + code2, { origin: null, body: JSON.stringify({ type: CONTRACTS_BUNDLE_TYPE, version: 1, contracts: [] }) }), env, deps);
          const rb = await refused.json();
          if (refused.status !== 400 || !String(rb.error).includes('non-empty "contracts" array')) throw new Error('empty bundle must refuse 400 naming the schema, got ' + refused.status + ': ' + rb.error);
          console.log('push-dry ok: ' + JSON.stringify(bundle).length + ' bytes under code ' + code + ', kind-tagged, byte-identical, deliver-once, malformed envelope refused by name');
        })().catch((e) => { console.error(e); process.exit(1); });
      `]);
      if (push.status !== 0 || !push.out.includes('push-dry ok:')) {
        throw new Error(`figma push DRY failed:\n${push.out}`);
      }
      console.log('journey-designer: manifest figma-emit (local CLI build) → 42-variant compiled set (14×3, tone-substituted fills, slash-bound tokens, icon+label anatomy) → push DRY through the real worker pipeline (zero network)');
    },
  },
  {
    // DETERMINISTIC ROUND-TRIP — the whole point: the journey is a chain of
    // PURE FUNCTIONS with no AI in the conversion. contract → canvas (the
    // plugin engine) is run TWICE and the built node trees must be
    // byte-identical (an AI in the loop could not guarantee that); then
    // canvas → contract (dump + propose) recovers the composite anatomy and the
    // loop closes; then contract → code (emit-react) emits from the same
    // contract. The AI only ever BUILDS this tooling — never runs the
    // conversion. Runs scripts/deterministic-roundtrip.mjs under tsx.
    id: 'deterministic-roundtrip',
    claim: 'C1-determinism',
    run: () => {
      const r = run(TSX, ['scripts/deterministic-roundtrip.mjs']);
      if (r.status !== 0) throw new Error(`deterministic-roundtrip failed:\n${r.out.slice(0, 1600)}`);
      for (const want of [
        'byte-identical', // contract→canvas run twice, identical → deterministic
        'round-trip closes: the anatomy that went to canvas came back',
        'emitted', // contract→code
        'THE FULL LOOP RAN WITH ZERO AI',
      ]) {
        if (!r.out.includes(want)) throw new Error(`deterministic-roundtrip missing "${want}":\n${r.out.slice(0, 1600)}`);
      }
      console.log('deterministic-roundtrip: contract→canvas byte-identical across two runs (deterministic), canvas→contract recovers the anatomy, contract→code emits — the full journey is pure functions, no AI in the conversion');
    },
  },
  {
    // ROUND 5c — REACT EMITTERS: hyphenated part names must emit VALID,
    // EXECUTABLE JavaScript. Found by the CI journey validation
    // (examples/ci/VALIDATION.md): round-4 promoted anatomies carry part
    // names like "label-2" / "icon-3-incomplete", and `styles.label-2`
    // PARSES — as subtraction (NaN class names); `styles.icon - 3 -
    // incomplete` throws ReferenceError the moment the part renders. A grep
    // or a parse pass cannot catch this class, so this eval EXECUTES both
    // emitted modules: the CSS-module emitter's output is esbuild-bundled
    // (local-css) and rendered with react-dom/server; the inline emitter's
    // output likewise. Every hyphen-named part is unconditionally visible in
    // the fixture, so the defective member accesses would evaluate.
    id: 'react-hyphenated-part-names-execute',
    claim: 'C3-detection',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import path from 'node:path';
        import { pathToFileURL } from 'node:url';
        import { build } from 'esbuild';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { emitReact } from './core/emit-react.ts';
        import { emitReactInline } from './core/emit-react-inline.ts';
        (async () => {
          const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
          const fixture = ContractSchema.parse({
            id: 'eval.hyphenparts',
            name: 'HyphenParts',
            version: '1.0.0',
            description: 'Eval fixture: round-4-style hyphenated part names.',
            semantics: { element: 'div' },
            props: [{
              name: 'children', description: 'text', type: 'text', required: true, default: 'hello-eval',
              bindings: { figma: { kind: 'TEXT', property: 'Label' }, code: { prop: 'children' } },
            }],
            states: [],
            anatomy: { root: { layout: { display: 'flex' }, parts: {
              'label-2': { content: { prop: 'children' }, literals: { 'padding-left': '2px' } },
              'note-3-static': { text: 'static run', literals: { 'padding-left': '2px' } },
              'icon-3-incomplete': { icon: { asset: 'eval-check' }, element: 'span' },
              'box-4': { layout: { display: 'flex' }, parts: { 'part-0-1': { text: 'leaf', literals: { 'padding-left': '2px' } } } },
            } } },
            anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/HyphenParts', export: 'HyphenParts' } },
          });
          const icons = new Map([['eval-check', '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h20v20H0z"/></svg>']]);
          const contracts = new Map([[fixture.id, fixture]]);

          // ---- CSS-module emitter: emit → bundle (local-css) → EXECUTE ----
          const { tsx, css } = emitReact(fixture, { tokens: new Set(), icons, contracts });
          if (/styles\\.[A-Za-z0-9_$]+\\s*-\\s*\\d/.test(tsx)) throw new Error('emitted tsx still contains a subtraction-parsed styles access');
          fs.mkdirSync('hyphen-eval', { recursive: true });
          fs.writeFileSync('hyphen-eval/HyphenParts.tsx', tsx);
          fs.writeFileSync('hyphen-eval/HyphenParts.module.css', css);
          fs.writeFileSync('hyphen-eval/entry.tsx', [
            "import { createElement } from 'react';",
            "import { renderToStaticMarkup } from 'react-dom/server';",
            "import { HyphenParts } from './HyphenParts';",
            "import styles from './HyphenParts.module.css';",
            "export const markup = renderToStaticMarkup(createElement(HyphenParts, null, 'hello-eval'));",
            "export const classMap = styles;",
          ].join('\\n'));
          await build({
            entryPoints: ['hyphen-eval/entry.tsx'], bundle: true, outfile: 'hyphen-eval/entry.cjs',
            format: 'cjs', platform: 'node', jsx: 'automatic', logLevel: 'silent',
            loader: { '.css': 'local-css' }, external: ['react', 'react-dom'],
          });
          const mod = await import(pathToFileURL(path.resolve('hyphen-eval/entry.cjs')).href);
          const { markup, classMap } = mod.default ?? mod;
          for (const part of ['label-2', 'note-3-static', 'icon-3-incomplete', 'icon-3-incompleteGlyph', 'box-4', 'part-0-1']) {
            const cls = classMap[part];
            if (typeof cls !== 'string' || cls.length === 0) throw new Error('css-module class missing for part ' + part);
            if (!markup.includes(cls)) throw new Error('rendered markup missing the class for part ' + part + ' (' + cls + ')');
          }
          if (markup.includes('NaN')) throw new Error('rendered markup contains NaN class names (the subtraction defect): ' + markup);
          if (!markup.includes('hello-eval') || !markup.includes('static run') || !markup.includes('leaf')) {
            throw new Error('fixture content missing from the render: ' + markup);
          }

          // ---- inline emitter: emit → bundle → EXECUTE (S['label-2']) ----
          const brands = Object.fromEntries(fs.readdirSync('tokens/modes').filter((f) => /^brand\\./.test(f)).map((f) => [f.replace(/^brand\\.|\\.tokens\\.json$/g, ''), read('tokens/modes/' + f)]));
          const tokens = { primitives: read('tokens/primitives.tokens.json'), semantic: read('tokens/semantic.tokens.json'), light: read('tokens/modes/semantic.light.tokens.json'), dark: {}, brands };
          const inline = emitReactInline(fixture, { tokens, icons, contracts, mode: 'light' });
          if (/S\\.[A-Za-z0-9_$]+\\s*-\\s*\\d/.test(inline.tsx)) throw new Error('inline emitter still contains a subtraction-parsed S access');
          fs.writeFileSync('hyphen-eval/Inline.tsx', inline.tsx);
          fs.writeFileSync('hyphen-eval/inline-entry.tsx', [
            "import { createElement } from 'react';",
            "import { renderToStaticMarkup } from 'react-dom/server';",
            "import { HyphenParts } from './Inline';",
            "export const markup = renderToStaticMarkup(createElement(HyphenParts, null, 'hello-inline'));",
          ].join('\\n'));
          await build({
            entryPoints: ['hyphen-eval/inline-entry.tsx'], bundle: true, outfile: 'hyphen-eval/inline-entry.cjs',
            format: 'cjs', platform: 'node', jsx: 'automatic', logLevel: 'silent',
            external: ['react', 'react-dom'],
          });
          const imod = await import(pathToFileURL(path.resolve('hyphen-eval/inline-entry.cjs')).href);
          const inlineMarkup = (imod.default ?? imod).markup;
          if (inlineMarkup.includes('NaN')) throw new Error('inline render contains NaN (the subtraction defect)');
          if (!inlineMarkup.includes('hello-inline') || !inlineMarkup.includes('static run')) {
            throw new Error('inline fixture content missing: ' + inlineMarkup);
          }
          console.log('hyphen-parts ok: both emitted modules EXECUTED — 5 hyphen-named classes rendered, no NaN, no ReferenceError');
        })().catch((e) => { console.error(e); process.exit(1); });
      `]);
      if (probe.status !== 0 || !probe.out.includes('hyphen-parts ok:')) {
        throw new Error(`hyphenated-part execution probe failed:\n${probe.out}`);
      }
      console.log('react-hyphenated-part-names-execute: emitReact + emitReactInline outputs bundled and EXECUTED with react-dom/server — hyphen-named parts render real classes (the styles.label-2 subtraction defect stays fixed)');
    },
  },
  {
    // ROUND 5d — GLYPH-RECONSTRUCTION CLASS PIN (owner defect: the Checkbox
    // check drew as SEGMENTED CAPSULES). Dash channels are pathLength-
    // RELATIVE and pathLength is an ATTRIBUTE, not a computed style (the
    // viewBox class) — Polaris normalizes the check path to pathLength=1 and
    // drives stroke-dashoffset as a draw-on animation, so the computed 2px
    // dasharray is an animation VEHICLE, not resting geometry. This pin
    // (a) re-runs reconstructSvg over the COMMITTED checkbox capture (whose
    // path style carries dasharray 2px) and asserts the emitted markup is a
    // dash-free continuous stroke with the named receipt, byte-equal to the
    // committed asset; (b) sweeps EVERY committed icon asset for the
    // signature — a dash channel reappearing in any asset fails by name.
    id: 'svg-dash-animation-vehicle-pin',
    claim: 'C3-detection',
    run: () => {
      const iconsDir = path.join(ROOT, 'examples/polaris/assets/icons');
      for (const f of readdirSync(iconsDir).filter((f) => f.endsWith('.svg'))) {
        const body = readFileSync(path.join(iconsDir, f), 'utf8');
        if (/stroke-dash(array|offset)/.test(body)) {
          throw new Error(`committed asset ${f} carries a dash channel — the animation-vehicle class is back`);
        }
      }
      // the PROMOTED check glyphs are the floor reconstruction verbatim
      // (promote-floor copies byte-for-byte; a divergence means a stale
      // promotion).
      for (const f of ['checkbox-icon-2-checked.svg', 'checkbox-icon-2-unchecked.svg']) {
        const promoted = readFileSync(path.join(iconsDir, f), 'utf8');
        const floor = readFileSync(path.join(ROOT, 'extract/computed/out/checkbox/assets', f), 'utf8');
        if (promoted !== floor) throw new Error(`${f}: promoted asset diverges from the floor reconstruction`);
      }
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { reconstructCaptures } from './extract/computed/replay.ts';
        import { reconstructSvg } from './extract/computed/anatomy.ts';
        const truth = JSON.parse(fs.readFileSync('extract/computed/out/checkbox/captured-truth.json', 'utf8'));
        const base = reconstructCaptures(truth)[0];
        let svgNode = null;
        const walk = (n) => {
          if (n.tag === 'svg' && !svgNode) { svgNode = n; return; }
          for (const c of n.nodes) if (c.t === 'el') walk(c.el);
        };
        walk(base.root);
        if (!svgNode) throw new Error('no svg element in the committed checkbox base capture');
        // the committed capture DOES carry the dash channels on the path —
        // the pin is meaningless if the fixture no longer has them.
        let pathNode = null;
        const walkP = (n) => { for (const c of n.nodes) if (c.t === 'el') { if (c.el.tag === 'path' && !pathNode) pathNode = c.el; walkP(c.el); } };
        walkP(svgNode);
        if (!pathNode || pathNode.style['stroke-dasharray'] !== '2px') {
          throw new Error('fixture drift: committed checkbox capture no longer carries stroke-dasharray 2px on the check path');
        }
        const receipts = [];
        const r = reconstructSvg(svgNode, receipts, 'eval', false);
        if (!r) throw new Error('reconstructSvg refused the committed checkbox glyph: ' + receipts.join('; '));
        if (/stroke-dash/.test(r.markup)) throw new Error('reconstruction still carries dash channels: ' + r.markup);
        if (!/stroke-linecap="round"/.test(r.markup)) throw new Error('reconstruction lost the round linecap: ' + r.markup);
        if ((r.markup.match(/<path /g) || []).length !== 1) throw new Error('check glyph is not a single path: ' + r.markup);
        if (!receipts.some((x) => x.startsWith('svg-dash-channels-dropped:'))) {
          throw new Error('dash drop is not receipted by name: ' + receipts.join('; '));
        }
        // (the eval scratch carries extract/ but not examples/ — the floor's
        // own asset is the byte-source promote-floor copies verbatim)
        const asset = fs.readFileSync('extract/computed/out/checkbox/assets/checkbox-icon-2-unchecked.svg', 'utf8').trim();
        if (asset !== r.markup) throw new Error('committed asset differs from a fresh reconstruction:\\n' + asset + '\\nvs\\n' + r.markup);
        console.log('dash pin ok: continuous single-path stroke, named receipt, byte-equal committed asset');
      `]);
      if (probe.status !== 0 || !probe.out.includes('dash pin ok:')) {
        throw new Error(`dash reconstruction probe failed:\n${probe.out}`);
      }
      console.log('svg-dash-animation-vehicle-pin: 22 committed assets dash-free; committed checkbox capture (dasharray 2px in style) reconstructs to the continuous stroke with the svg-dash-channels-dropped receipt, byte-equal to the committed asset');
    },
  },
  {
    // ROUND 5d — MARGIN/GAP CLASS PIN (owner defect: the Checkbox and
    // RadioButton control↔label gap was missing on the live canvas; the
    // Badge pip drew oversized). The contracts carry the gap as a
    // choice-control margin-right token; margins used to be a preview-only
    // fact the sync runtime never applied. The compile now lowers a uniform
    // positive sibling margin to the parent's itemSpacing BOUND TO THE
    // MARGIN'S OWN VARIABLE, and the runtime applies every residual margin
    // as the child's CSS margin box (wrapper frame). This pin reads the
    // COMMITTED emitted scripts (generate.ts --check guards contract↔script
    // drift), so a regression in either the compile or the emit fails here
    // by name.
    id: 'canvas-margin-gap-pin',
    claim: 'C3-detection',
    run: () => {
      const fig = (f: string) => readFileSync(path.join(ROOT, 'examples/polaris/figma', f), 'utf8');
      const cb = fig('checkbox.figma.js');
      if (!cb.includes('"itemSpacing": "imported/checkbox/choice-control/margin-right"')) {
        throw new Error('checkbox root gap no longer binds imported/checkbox/choice-control/margin-right as itemSpacing');
      }
      const rb = fig('radio-button.figma.js');
      if (!rb.includes('"itemSpacing": "imported/radio-button/choice-control/margin-right"')) {
        throw new Error('radio-button root gap no longer binds imported/radio-button/choice-control/margin-right as itemSpacing');
      }
      const badge = fig('badge.figma.js');
      if (!badge.includes('"margins"')) {
        throw new Error('badge icon lost its residual margin facts (the -2/-2/-8 pip box)');
      }
      if (!badge.includes('function applyMarginBox(')) {
        throw new Error('badge script lost the margin-box runtime — residual margins would silently not apply on canvas again');
      }
      // the radius half of the owner question: every corner rides the
      // semantic token, no minted sibling leaves.
      for (const corner of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
        if (!badge.includes(`"${corner}": "p/border-radius-200"`)) {
          throw new Error(`badge ${corner} no longer binds p/border-radius-200`);
        }
      }
      // (imported/shared/size-8 may legitimately appear in the shared minted
      // preamble for OTHER components' channels — only a radius BINDING to
      // it is the regression.)
      if (/"(topLeft|topRight|bottomLeft|bottomRight)Radius": "imported\/shared\/size-8"/.test(badge)) {
        throw new Error('badge script binds a corner to imported/shared/size-8 — the shorthand-coverage class is back');
      }
      console.log('canvas-margin-gap-pin: checkbox/radio itemSpacing binds the margin-right variable; badge keeps residual pip margins + applyMarginBox runtime; all four badge corners bind p/border-radius-200 (no size-8 siblings)');
    },
  },
  {
    // Round 5f — CLASS 4a: amendSet must run applyMarginBox on TOP-LEVEL
    // variant children. buildNode applied margin boxes only to NESTED children
    // (its own loop); the AMEND path's variant-child loop called buildNode +
    // applyOverlay only, so every margins-carrying DIRECT child of a variant
    // root lost its margin box on re-amend (B5E finding 1: Badge pip 24→20,
    // Button icon, TextField label gap). This pin reads the COMMITTED emitted
    // scripts: the margin-box runtime AND both call sites (create=buildNode,
    // amend=amendSet) must be present so a re-amend carries margins at source.
    id: 'amend-margin-box',
    claim: 'C3-detection',
    run: () => {
      const fig = (f: string) => readFileSync(path.join(ROOT, 'examples/polaris/figma', f), 'utf8');
      for (const f of ['badge.figma.js']) {
        const s = fig(f);
        if (!s.includes('function applyMarginBox(')) throw new Error(`${f}: no margin-box runtime`);
        // create path (buildNode): applyMarginBox(node, childNode, child)
        if (!s.includes('applyMarginBox(node, childNode, child)')) throw new Error(`${f}: buildNode create path lost applyMarginBox`);
        // amend path (amendSet): applyMarginBox(comp, childNode, childSpec) —
        // the B5E-finding-1 fix; without it top-level margins vanish on re-amend
        if (!s.includes('applyMarginBox(comp, childNode, childSpec)')) {
          throw new Error(`${f}: amendSet top-level child loop is MISSING applyMarginBox — B5E finding 1 regressed (Badge pip would measure 24px on re-amend, spec/gate say 20px)`);
        }
      }
      console.log('amend-margin-box: badge script carries applyMarginBox on BOTH the create (buildNode) and re-amend (amendSet) top-level child loops — margins now survive a re-amend at source, not a canvas correction');
    },
  },
  {
    // Round 5f — CLASS 3: the Checkbox check glyph (and RadioButton dot) must
    // be CENTERED in the control box. The captured display:block carried no
    // centering, so a glyph inside an inset-0 absolute overlay pinned
    // top-left (owner: not centered vertically/horizontally). The emit now
    // centers an inset-overlay container that HAS content; an empty backdrop
    // overlay stays untouched. Verified through the REAL compile on a
    // synthesized fixture (an 18-box with an absolute inset overlay wrapping a
    // 14-box glyph).
    id: 'checkbox-center',
    claim: 'C3-detection',
    run: () => {
      const emptyTokens = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };
      const engine = createFigmaEngine({ tokens: emptyTokens, icons: new Map() });
      const fixture: any = {
        id: 'fixture.control', name: 'Control', version: '0.0.0', status: 'draft',
        description: 'synthesized inset-overlay centering fixture', semantics: { element: 'span' },
        props: [{ name: 'variant', type: { enum: ['a'] }, default: 'a',
          bindings: { figma: { kind: 'VARIANT', property: 'V' }, code: { prop: 'variant' } } }],
        states: [],
        anatomy: { root: { layout: { display: 'flex' }, parts: {
          box: { element: 'span', declared: { position: 'relative', width: '18px', height: '18px' }, parts: {
            backdrop: { shape: { kind: 'rect', width: 18, height: 18 } },
            // absolute inset overlay WITH content — must center the glyph
            glyph: { element: 'span', declared: { position: 'absolute', 'aspect-ratio': '1 / 1' }, parts: {
              inner: { element: 'span', declared: { width: '14px', height: '14px' } },
            } },
          } },
        } } },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'x', export: 'Control' } },
      };
      ContractSchema.parse(fixture);
      const data = engine.compileComponentData(fixture, new Map([[fixture.id, fixture]]));
      const find = (s: any, name: string): any => s.name === name ? s : (s.children ?? []).map((c: any) => find(c, name)).find(Boolean);
      const glyph = find(data.variants[0].spec, 'glyph');
      if (!glyph) throw new Error('inset-overlay glyph part not compiled');
      if (!glyph.insetOverlay) throw new Error('glyph part is not an inset overlay (position:absolute inset:0)');
      if (glyph.layout?.primary !== 'CENTER' || glyph.layout?.counter !== 'CENTER') {
        throw new Error(`inset-overlay content is NOT centered: layout=${JSON.stringify(glyph.layout)} — the check glyph would pin top-left`);
      }
      // an empty backdrop overlay must NOT be force-centered (byte-neutral guard):
      const backdrop = find(data.variants[0].spec, 'backdrop');
      if (backdrop?.insetOverlay && (backdrop.children?.length ?? 0) === 0 && backdrop.layout?.primary === 'CENTER') {
        throw new Error('empty backdrop overlay was force-centered — should be untouched');
      }
      console.log('checkbox-center: an inset-overlay container WITH content compiles to CENTER/CENTER (glyph centered in the control box); empty backdrop overlays untouched');
    },
  },
  {
    // Round 5f — OPTIONAL-ADORNMENT-FORCED-PRESENT, the general rule as a
    // SYNTHESIZED minimal fixture (independent of Polaris): a component with
    // BOTH adornment shapes — an optional-ICON boolean (withIcon) and an
    // optional-PIP defaultless enum whose unset value the promotion
    // materialized as the default (pip: none|a|b, default none, base-hidden
    // shownWhen). Proves, through the REAL canvas compile (createFigmaEngine
    // .compileComponentData):
    //   · the DEFAULT variant (first) carries NO pip part (adornment absent);
    //   · a pip=set variant DOES carry it (adornment present);
    //   · the boolean toggle is EXPOSED as a Figma BOOLEAN property (a
    //     designer can turn the icon ON), default OFF → the icon node renders
    //     EMPTY (visibleDefault false), never a drawn box;
    //   · the unset value IS enumerated as a real variant (the plain cell).
    id: 'optional-adornment-gating-general-fixture',
    claim: 'C3-detection',
    run: () => {
      const emptyTokens = { primitives: {}, semantic: {}, light: {}, dark: {}, brands: { default: {} } };
      const engine = createFigmaEngine({ tokens: emptyTokens, icons: new Map() });
      const fixture: any = {
        id: 'fixture.adorned', name: 'Adorned', version: '0.0.0', status: 'draft',
        description: 'synthesized optional-adornment fixture', semantics: { element: 'span' },
        props: [
          { name: 'label', type: 'text', default: 'Hi',
            bindings: { figma: { kind: 'TEXT', property: 'Label' }, code: { prop: 'children' } } },
          { name: 'withIcon', type: 'boolean', default: false,
            bindings: { figma: { kind: 'BOOLEAN', property: 'Show Icon' }, code: { prop: 'withIcon' } } },
          // defaultless-origin enum, unset value 'none' materialized as default
          { name: 'pip', type: { enum: ['none', 'a', 'b'] }, default: 'none',
            bindings: { figma: { kind: 'VARIANT', property: 'Pip' }, code: { prop: 'pip' } } },
        ],
        states: [],
        anatomy: {
          root: {
            layout: { display: 'flex', align: 'center' },
            parts: {
              icon: { element: 'span', declared: { width: '20px', height: '16px' },
                visibleWhen: { prop: 'withIcon' },
                description: 'optional icon, boolean-gated' },
              pip: { element: 'span', declared: { display: 'none' },
                stylesWhen: [
                  { prop: 'pip', equals: 'a', styles: { display: 'block' } },
                  { prop: 'pip', equals: 'b', styles: { display: 'block' } },
                ],
                description: 'optional pip, base-hidden defaultless enum' },
              label: { element: 'span', text: 'Hi' },
            },
          },
        },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'x', export: 'Adorned' } },
      };
      ContractSchema.parse(fixture);
      const data = engine.compileComponentData(fixture, new Map([[fixture.id, fixture]]));
      const childNames = (v: any) => (v.spec.children ?? []).map((c: any) => c.name);
      // default variant is first; it is the plain (Pip=none) cell
      const def = data.variants[0];
      if (!/Pip=none/.test(def.name)) throw new Error(`default variant is not the plain Pip=none cell: "${def.name}"`);
      if (childNames(def).includes('pip')) throw new Error('default (Pip=none) variant DREW the pip — adornment forced present');
      // the unset value is a real enumerated variant, AND set values remain
      const names = data.variants.map((v: any) => v.name);
      if (!names.some((n: string) => /Pip=a/.test(n))) throw new Error('pip=a variant not enumerated (set values lost)');
      const pipA = data.variants.find((v: any) => /Pip=a/.test(v.name))!;
      if (!childNames(pipA).includes('pip')) throw new Error('pip=a variant did NOT draw the pip (adornment gate broken)');
      // the boolean toggle is exposed, default OFF, icon renders empty
      const bp = data.boolProps.find((b: any) => b.property === 'Show Icon');
      if (!bp) throw new Error('withIcon boolean toggle "Show Icon" not exposed as a Figma property');
      if (bp.default !== false) throw new Error('withIcon default is not OFF — the default variant would draw the icon');
      const iconNode = (def.spec.children ?? []).find((c: any) => c.name === 'icon');
      if (!iconNode) throw new Error('icon node missing entirely');
      if (iconNode.visibleDefault !== false) throw new Error('icon visibleDefault is not false — the empty icon box would draw by default');
      console.log('optional-adornment-gating-general-fixture: default variant plain (no pip), pip=a variant has it, "Show Icon" boolean exposed default OFF (icon node visibleDefault false), unset value enumerated as a real variant');
    },
  },
  // -------------------------------------------------------------------------
  // DEPTH BUILD — Stage A+B pins (portal-aware capture + multi-root anatomy).
  // Deterministic + browser-free: they read the committed production receipt
  // (extract/computed/depth/receipts/, generated by depth-receipt.ts) and re-run
  // the PRODUCTION anatomy functions over it. Regenerate the receipt with
  //   npx tsx extract/computed/depth/depth-receipt.ts --harness <polaris-sandbox>
  // -------------------------------------------------------------------------
  {
    // Stage A: the whole-document baseline-diff reader captures the Modal
    // dialog PORTALED to document.body, exactly where the CURRENT in-stage
    // reader (stage.firstElementChild) sees NOTHING (ADVANCED-PROBE N1).
    id: 'portal-capture-modal',
    claim: 'C5-extraction',
    run: () => {
      const cap = JSON.parse(
        readFileSync(path.join(ROOT, 'extract/computed/depth/receipts/modal.capture.json'), 'utf8'),
      ) as {
        currentReader: { present: boolean; descendantEls: number };
        roots: Array<{ location: string; bytes: number; node: DepthNode }>;
      };
      // the current in-stage floor reader is ABSENT — the sweep would throw today
      if (cap.currentReader.present !== false || cap.currentReader.descendantEls !== 0) {
        throw new Error(`current in-stage reader is not absent (present=${cap.currentReader.present}) — the portal escape was not proven`);
      }
      const portaled = cap.roots.filter((r) => r.location === 'portaled');
      const inStage = cap.roots.filter((r) => r.location === 'in-stage');
      if (portaled.length < 1) throw new Error('no portaled root captured — Modal renders 100% into a portal');
      if (inStage.length !== 0) throw new Error('unexpected in-stage root for a fully portaled Modal');
      const portalBytes = portaled.reduce((n, r) => n + r.bytes, 0);
      if (portalBytes < 3000) throw new Error(`portaled DOM ${portalBytes} B is too small to be the real dialog subtree`);
      // the portaled root descends (production descent) to the real roots
      const real = cap.roots.flatMap((r) => descendToRealRoots(r.node));
      if (real.length < 2) throw new Error(`descent yielded ${real.length} real root(s) — expected the dialog + backdrop`);
      console.log(`portal-capture-modal: current reader ABSENT (0) → 1 portaled root, ${portalBytes} B dialog; descends to ${real.length} real roots`);
    },
  },
  {
    // Stage B: the PRODUCTION descent + multi-root union/promotion turns the
    // captured portal tree into a real MULTI-ROOT anatomy {dialog, backdrop}
    // (the current single-root reader returns 0). Schema-valid with NO schema
    // change (anatomy is already Record<string, Part>).
    id: 'multi-root-anatomy',
    claim: 'C5-extraction',
    run: () => {
      const cap = JSON.parse(
        readFileSync(path.join(ROOT, 'extract/computed/depth/receipts/modal.capture.json'), 'utf8'),
      ) as { roots: Array<{ node: DepthNode }> };
      const cfg = loadCaptureConfig(ROOT, path.join(ROOT, 'extract/computed/configs/polaris-depth.json'));
      const modal = cfg.components.find((c) => c.name === 'Modal')!;
      const space = propSpaceFor(ROOT, cfg, modal);
      const multi = buildMultiRootUnion(
        [{ combo: space.baseComboKey, interaction: 'default', newRoots: cap.roots.map((r) => r.node) }],
        `${space.baseComboKey}__default`,
        modal.name,
        cfg.library.classPrefix,
      );
      const promo = promoteMultiRootAnatomy(space, modal, multi, depthKebab(space.contract.name));
      // multi-root anatomy is schema-valid with NO schema change
      ContractSchema.parse(promo.contract);
      const roots = Object.keys(promo.contract.anatomy);
      if (roots.length !== 2) throw new Error(`expected 2 anatomy roots, got ${roots.length}: ${roots.join(', ')}`);
      if (!roots.includes('dialog') || !roots.includes('backdrop')) {
        throw new Error(`multi-root anatomy is not {dialog, backdrop}: ${roots.join(', ')}`);
      }
      // match/beat the spike (2 roots, 17 parts, depth 7)
      if (promo.partCount < 17) throw new Error(`promoted ${promo.partCount} parts (< spike 17)`);
      if (promo.depth < 7) throw new Error(`promoted depth ${promo.depth} (< spike 7)`);
      console.log(`multi-root-anatomy: {${roots.join(', ')}}, ${promo.partCount} parts depth ${promo.depth} (spike 17/7) — single-root reader returns 0`);
    },
  },
  {
    // REGRESSION GUARD: the multi-root path is ADDITIVE. For an HTML-rooted
    // component (Badge/Button/Checkbox) descent is a no-op — realRootsOf(root)
    // == [root] — so the multi-root promoted anatomy is BYTE-IDENTICAL to the
    // single-root promotion. Proves Stage A+B does not shift the committed 12.
    id: 'simple-component-anatomy-unchanged',
    claim: 'C1-determinism',
    run: () => {
      const cfg = loadCaptureConfig(ROOT, path.join(ROOT, 'extract/computed/configs/polaris.json'));
      for (const name of ['Badge', 'Button', 'Checkbox']) {
        const sc = cfg.components.find((c) => c.name === name)!;
        const ss = propSpaceFor(ROOT, cfg, sc);
        const truth = JSON.parse(
          readFileSync(path.join(ROOT, 'extract/computed/out', name.toLowerCase(), 'captured-truth.json'), 'utf8'),
        ) as { base: { root: DepthNode } };
        const root = truth.base.root;
        const rr = descendToRealRoots(root);
        if (!(rr.length === 1 && rr[0] === root)) {
          throw new Error(`${name}: realRootsOf(root) descended a wrapper — the census root is not preserved`);
        }
        const caps: DepthCapture[] = [{ combo: ss.baseComboKey, interaction: 'default', root }];
        const uSingle = depthBuildUnion(caps, caps[0], cfg.library.classPrefix);
        depthNameUnion(uSingle.entries, sc.name, cfg.library.classPrefix);
        const single = depthPromoteAnatomy(ss, sc, uSingle, depthKebab(ss.contract.name)).contract.anatomy;
        const m = buildMultiRootUnion(
          [{ combo: ss.baseComboKey, interaction: 'default', newRoots: [root] }],
          `${ss.baseComboKey}__default`,
          sc.name,
          cfg.library.classPrefix,
        );
        const multiA = promoteMultiRootAnatomy(ss, sc, m, depthKebab(ss.contract.name)).contract.anatomy;
        if (JSON.stringify(single) !== JSON.stringify(multiA)) {
          throw new Error(`${name}: multi-root anatomy differs from single-root anatomy — the multi-root path is NOT additive`);
        }
      }
      console.log('simple-component-anatomy-unchanged: Badge/Button/Checkbox descend zero wrappers; multi-root anatomy == single-root anatomy (byte-identical)');
    },
  },
  {
    // ADVANCED-COMPOSITION GATE — the multi-root Modal emits on all four
    // surfaces. The depth north star (both journeys) needed the emitters +
    // validator to consume MULTI-ROOT anatomy (a captured composite = several
    // top-level roots). This pin runs the committed receipt harness
    // (examples/depth-modal/emit-modal-receipt.ts) which drives the assembled
    // schema-valid composite `ds.modal-composite` ({dialog, backdrop}) through
    // every emitter and PROVES each by EXECUTION (not grep): emit-react +
    // emit-react-inline are esbuild-bundled and rendered with react-dom/server
    // (real modal markup — role="dialog" header→(title,close), body,
    // footer→(Cancel,Save), sibling backdrop); emit-html carries the same
    // static markup; emit-figma-script's COMPONENTS payload referees to ONE
    // variant frame whose children are both roots AND the whole script
    // headless-executes in a VM against the mocked figma global.
    // examples/ is not copied into scratch (see astryx-dev-journey), so the
    // harness + contract are staged in first; it writes into the staged scratch
    // copy (never the committed ROOT artifacts).
    id: 'emitter-multi-root-modal',
    claim: 'C8-journey',
    run: () => {
      cpSync(
        path.join(ROOT, 'examples', 'depth-modal'),
        path.join(SCRATCH, 'examples', 'depth-modal'),
        { recursive: true },
      );
      const r = run(TSX, ['examples/depth-modal/emit-modal-receipt.ts']);
      if (r.status !== 0 || !r.out.includes('all 5 surfaces emitted + EXECUTED')) {
        throw new Error(`multi-root Modal receipt failed:\n${r.out.slice(0, 1600)}`);
      }
      // The harness prints one ✔ line per surface; require all five.
      for (const surface of [
        'emit-react —',
        'emit-react-inline —',
        'emit-html —',
        'emit-figma-script (referee)',
        'emit-figma-script (headless)',
      ]) {
        if (!r.out.includes(`✔ ${surface}`)) {
          throw new Error(`multi-root Modal: surface "${surface}" did not pass:\n${r.out.slice(0, 1600)}`);
        }
      }
      console.log('emitter-multi-root-modal: {dialog, backdrop} emits valid React (bundles+renders headless) + HTML markup + figma-script (referee frame carries both roots, headless-executes) — dialog+backdrop present, Cancel/Save actions render');
    },
  },
  {
    // SINGLE-ROOT GOLDEN INVARIANT — the multi-root generalization is ADDITIVE.
    // Every repo contract is single-root (one top-level "root"), so each takes
    // the UNTOUCHED N=1 emitter path: a forwardRef component around one root
    // element, a `.root` CSS rule, and NEVER the multi-root Fragment branch.
    // The BYTE authority is `golden-generated-output` (it re-hashes every
    // src/ + figma-sync file against evals/golden.json); this pin names that
    // dependency and proves the branch SELECTION directly — a single-root
    // contract must not carry one byte of the multi-root marker.
    id: 'single-root-golden-invariant',
    claim: 'C1-determinism',
    run: () => {
      const byId = new Map(
        readdirSync(path.join(ROOT, 'contracts'))
          .filter((f) => f.endsWith('.contract.json'))
          .map((f) => ContractSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'contracts', f), 'utf8'))))
          .map((c) => [c.id, c]),
      );
      // Arbitrary vector assets share the external-asset registry with icons;
      // their contract vocabulary differs, not their loading mechanism.
      const icons = new Map(
        ['icons', 'vectors'].flatMap((kind) =>
          readdirSync(path.join(ROOT, 'assets', kind))
            .filter((f) => f.endsWith('.svg'))
            .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', kind, f), 'utf8').trim()] as const),
        ),
      );
      const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
      const tokenInv = tokenInventoryFromJson([
        read('tokens/primitives.tokens.json'),
        read('tokens/semantic.tokens.json'),
        read('tokens/modes/semantic.light.tokens.json'),
      ]);
      let multiRootCount = 0;
      for (const c of byId.values()) if (coreIsMultiRoot(c)) multiRootCount++;
      if (multiRootCount !== 0) {
        throw new Error(`${multiRootCount} repo contract(s) are multi-root — the golden set must be all single-root`);
      }
      for (const id of byId.keys()) {
        const c = byId.get(id)!;
        const { tsx, css } = coreEmitReact(c, { tokens: tokenInv, icons, contracts: byId });
        if (coreIsMultiRoot(c)) throw new Error(`${id}: isMultiRoot true — expected single-root`);
        if (tsx.includes('MULTI-ROOT composite')) {
          throw new Error(`${id}: single-root emit carries the multi-root marker — the branch guard leaked`);
        }
        if (!tsx.includes('forwardRef<')) throw new Error(`${id}: single-root React is not the forwardRef component`);
        if (!/\.root\s*\{/.test(css)) throw new Error(`${id}: single-root CSS lost its .root rule`);
      }
      console.log(`single-root-golden-invariant: all ${byId.size} repo contracts are single-root (0 multi-root); Badge/Button/Card take the untouched forwardRef+.root path, zero multi-root marker — byte authority is golden-generated-output`);
    },
  },
  {
    // v18 extraction floor: a captured Figma VECTOR/GROUP asset becomes an
    // external reference and preserves its captured root/part geometry. The
    // proposal must never contain SVG path data.
    id: 'vector-asset-figma-capture-proposes-external-geometry',
    claim: 'C5-extraction',
    run: () => {
      const out = 'tmp/vector-asset-proposal';
      const result = run(TSX, ['extract/figma/propose.ts', 'extract/out/figma/piqueray-logo.vector.dump.json', '--out', out, '--contracts', 'contracts']);
      if (result.status !== 0) throw new Error(`vector capture proposal failed:\n${result.out}`);
      const proposal = JSON.parse(readFileSync(path.join(SCRATCH, out, 'piqueray-logo.contract.proposed.json'), 'utf8'));
      const root = proposal.anatomy.root;
      const mark = root.parts.Marque;
      const wordmark = root.parts.Wordmark;
      if (root.literals?.width !== '180px' || root.literals?.height !== '34px') throw new Error(`captured root geometry lost: ${JSON.stringify(root.literals)}`);
      if (mark.vectorAsset?.asset !== 'piqueray-logo-marque' || mark.vectorAsset?.width !== 25.96292495727539 || mark.tokens?.color !== '{color.orange}') {
        throw new Error(`mark did not promote to a color-bound vectorAsset: ${JSON.stringify(mark)}`);
      }
      if (wordmark.vectorAsset?.asset !== 'piqueray-logo-wordmark' || wordmark.vectorAsset?.position?.x !== 34.329803466796875 || wordmark.tokens?.color !== '{color.bleu}' || wordmark.tokensByProp?.map?.blanc?.color !== '{color.blanc}') {
        throw new Error(`wordmark did not preserve vector geometry/tone mapping: ${JSON.stringify(wordmark)}`);
      }
      if (JSON.stringify(proposal).includes('svgBase64') || JSON.stringify(proposal).includes('<path')) throw new Error('proposal leaked SVG geometry into contract JSON');
      const promotedMark = path.join(SCRATCH, out, 'assets', 'vectors', 'piqueray-logo-marque.svg');
      const promotedWordmark = path.join(SCRATCH, out, 'assets', 'vectors', 'piqueray-logo-wordmark.svg');
      for (const assetPath of [promotedMark, promotedWordmark]) {
        if (!existsSync(assetPath)) throw new Error(`captured SVG was not promoted: ${assetPath}`);
        const svg = readFileSync(assetPath, 'utf8');
        if (!svg.includes('currentColor') || /fill="#|fill="white"/i.test(svg)) throw new Error(`promoted SVG was not normalized to currentColor: ${assetPath}`);
      }
      const manifest = JSON.parse(readFileSync(path.join(SCRATCH, out, 'vector-assets.manifest.json'), 'utf8'));
      if (manifest.assets?.length !== 2 || manifest.assets.some((a: { sha256?: string; bytes?: number }) => !/^[a-f0-9]{64}$/.test(a.sha256 ?? '') || !(typeof a.bytes === 'number' && a.bytes > 0))) {
        throw new Error(`vector promotion manifest is incomplete: ${JSON.stringify(manifest)}`);
      }
      const staticSvg = readFileSync(promotedMark, 'utf8').replaceAll('currentColor', '#F98A0B');
      const normalized = normalizeVectorSvg(staticSvg);
      if (!normalized.svg.includes('currentColor') || normalized.svg.includes('#F98A0B')) throw new Error('static Figma paint was not deterministically normalized');
      let refused = false;
      try { normalizeVectorSvg('<svg viewBox="0 0 10 10"><g/></svg>'); } catch { refused = true; }
      if (!refused) throw new Error('empty SVG geometry was accepted');
    },
  },
  {
    // v18 arbitrary vector assets: a non-square, monochrome SVG is an asset
    // reference (never paths in the contract), gets inline React markup and a
    // real, token-bound Figma vector at its captured dimensions. This fixture
    // predates the PiquerayLogo adoption so a missing source export can never
    // be papered over with empty boxes.
    id: 'vector-asset-non-square-token-bound',
    claim: 'C3-detection',
    run: () => {
      const markSvg = '<svg width="25.963" height="34" viewBox="0 0 25.963 34" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H25.963V34H0Z" fill="currentColor"/></svg>';
      const wordSvg = '<svg width="145.67" height="25.004" viewBox="0 0 145.67 25.004" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H145.67V25.004H0Z" fill="currentColor"/></svg>';
      const fixture = ContractSchema.parse({
        id: 'ds.vectorfixture', name: 'VectorFixture', version: '1.0.0', status: 'draft',
        description: 'Eval fixture: arbitrary rectangular vector assets.', semantics: { element: 'div', role: 'img' },
        props: [{ name: 'tone', type: { enum: ['default', 'blanc'] }, default: 'default',
          bindings: { figma: { kind: 'VARIANT', property: 'Tone', values: { default: 'Default', blanc: 'Blanc' } }, code: { prop: 'tone' } } }],
        states: [],
        anatomy: { root: { tokens: { width: '{fixture.width}', height: '{fixture.height}' }, parts: {
          mark: { vectorAsset: { asset: 'fixture-mark', width: 25.963, height: 34, position: { x: 0, y: 0 } }, tokens: { color: '{fixture.orange}' } },
          wordmark: { vectorAsset: { asset: 'fixture-wordmark', width: 145.67, height: 25.004, position: { x: 34.33, y: 5.96 } }, tokens: { color: '{fixture.blue}' }, tokensByProp: { prop: 'tone', map: { blanc: { color: '{fixture.white}' } } } },
        } } },
        anchors: { figma: { fileKey: null, componentSetKey: null }, code: { importPath: 'src/components/VectorFixture', export: 'VectorFixture' } },
      });
      const assets = new Map([['fixture-mark', markSvg], ['fixture-wordmark', wordSvg]]);
      const tokenNames = new Set(['fixture.width', 'fixture.height', 'fixture.orange', 'fixture.blue', 'fixture.white']);
      const errors: string[] = [];
      coreValidateContract(fixture, new Map([[fixture.id, fixture]]), errors, assets);
      if (errors.length) throw new Error(`valid vectorAsset fixture refused: ${errors.join('; ')}`);
      const invalid = JSON.parse(JSON.stringify(fixture));
      invalid.anatomy.root.parts.mark.vectorAsset.asset = 'empty-vector';
      const invalidErrors: string[] = [];
      coreValidateContract(invalid, new Map([[invalid.id, invalid]]), invalidErrors, new Map([...assets, ['empty-vector', '<svg viewBox="0 0 10 10"></svg>']]));
      if (!invalidErrors.some((e) => e.includes('no drawable SVG geometry'))) throw new Error(`empty vector asset was not refused: ${invalidErrors.join('; ')}`);
      const { tsx, css } = coreEmitReact(fixture, { tokens: tokenNames, icons: assets, contracts: new Map([[fixture.id, fixture]]) });
      if ((tsx.match(/dangerouslySetInnerHTML/g) ?? []).length !== 2 || !tsx.includes('fixture-mark') || !tsx.includes('fixture-wordmark')) {
        throw new Error(`React did not inject both SVG assets:\n${tsx.slice(0, 1600)}`);
      }
      for (const expected of ['width: var(--fixture-width)', 'height: var(--fixture-height)', 'width: 25.963px', 'height: 25.004px', 'left: 34.33px', 'top: 5.96px']) {
        if (!css.includes(expected)) throw new Error(`React CSS lost vector geometry ${expected}:\n${css}`);
      }
      const tokenTree = { primitives: { fixture: {
        width: { $value: '180px', $type: 'dimension' }, height: { $value: '34px', $type: 'dimension' },
        orange: { $value: '#ff6500', $type: 'color' }, blue: { $value: '#0055aa', $type: 'color' }, white: { $value: '#ffffff', $type: 'color' },
      } }, semantic: {}, light: {}, dark: {}, brands: { default: {} } };
      const engine = createFigmaEngine({ tokens: tokenTree, icons: assets });
      const emitted = engine.buildComponentScript(fixture, new Map([[fixture.id, fixture]]));
      const data = JSON.parse(emitted.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      const spec = data.variants.find((v: any) => v.name.includes('Tone=Default')).spec;
      const find = (node: any, name: string): any => node.name === name ? node : (node.children ?? []).map((child: any) => find(child, name)).find(Boolean);
      const mark = find(spec, 'mark');
      const wordmark = find(spec, 'wordmark');
      if (!mark?.svg || mark.svgSize?.width !== 25.963 || mark.svgSize?.height !== 34 || mark.absolute?.left !== 0 || mark.absolute?.top !== 0) {
        throw new Error(`Figma mark spec lost SVG geometry: ${JSON.stringify(mark)}`);
      }
      if (!wordmark?.svg || wordmark.svgSize?.width !== 145.67 || wordmark.svgSize?.height !== 25.004 || wordmark.absolute?.left !== 34.33 || wordmark.absolute?.top !== 5.96 || wordmark.svgPaintVar !== 'fixture/blue') {
        throw new Error(`Figma wordmark spec lost geometry or token binding: ${JSON.stringify(wordmark)}`);
      }
      const runtime = path.join(SCRATCH, 'vector-asset-runtime.ts');
      writeFileSync(runtime, `
        import vm from 'node:vm';
        import { createFigmaMock } from './scripts/plugin-engine-mock-figma.mjs';
        import { createFigmaEngine } from './core/emit-figma-script.ts';
        const fixture = ${JSON.stringify(fixture)};
        const assets = new Map(${JSON.stringify([...assets])});
        const tokens = ${JSON.stringify(tokenTree)};
        const engine = createFigmaEngine({ tokens, icons: assets });
        const tokenScript = engine.buildTokensScript(null);
        const script = engine.buildComponentScript(fixture, new Map([[fixture.id, fixture]]));
        const { figma, root } = createFigmaMock();
        const context = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
        await vm.runInContext('(async () => {\\n' + tokenScript + '\\n})()', context);
        await vm.runInContext('(async () => {\\n' + script + '\\n})()', context);
        const mark = root.findOne((n) => n.name === 'mark');
        const wordmark = root.findOne((n) => n.name === 'wordmark');
        if (!mark || !wordmark || mark.width !== 25.963 || mark.height !== 34 || wordmark.width !== 145.67 || wordmark.height !== 25.004 || mark.vectorNodeCount !== 1 || wordmark.vectorNodeCount !== 1) throw new Error('runtime vector dimensions or geometry missing');
        console.log('vector runtime dimensions + geometry ok');
      `);
      const runtimeResult = run(TSX, [runtime]);
      if (runtimeResult.status !== 0 || !runtimeResult.out.includes('vector runtime dimensions + geometry ok')) {
        throw new Error(`mock Figma runtime did not create non-empty vectors:\n${runtimeResult.out}`);
      }
    },
  },
  {
    // ASTRYX DEV-JOURNEY pin — the second-system exhibit's runnable tail.
    // The 10 promoted flagship contracts (examples/astryx/contracts, code-side
    // extraction of @astryxdesign/core@0.1.6) are the developer-journey input;
    // this pin asserts the two load-bearing invariants self-contained (no
    // network, no sandbox): (1) the LOCAL generator turns them into React +
    // CSS + stories BYTE-STABLE (two runs, identical tree hash), and (2) a
    // committed Figma sync script COMPILES (the referee: its COMPONENTS
    // payload parses to the Badge set with the full 14-tone variant grid).
    // examples/ is not copied into scratch by resetScratch, so the fixture is
    // staged in first; generation runs through the SAME generateComponents the
    // ds-contracts CLI's `generate` verb calls.
    id: 'astryx-dev-journey',
    claim: 'C8-journey',
    run: () => {
      cpSync(path.join(ROOT, 'examples', 'astryx'), path.join(SCRATCH, 'examples', 'astryx'), {
        recursive: true,
      });
      // 1. generate byte-stable — the SAME CLI shell `npm run generate` runs
      //    (scripts/generate-components.ts), twice, over the 10 flagship
      //    contracts; the two output trees must hash identical.
      const genArgs = (out: string) => [
        'scripts/generate-components.ts',
        '--contracts', 'examples/astryx/contracts',
        '--tokens', 'examples/astryx/tokens/astryx.dtcg.json',
        '--out', out,
        '--stories',
      ];
      const a = run(TSX, genArgs('examples/astryx/.pin-a'));
      if (a.status !== 0 || !a.out.includes('Generated 10 component(s)')) {
        throw new Error(`astryx generate (run A) did not emit 10 components:\n${a.out}`);
      }
      const b = run(TSX, genArgs('examples/astryx/.pin-b'));
      if (b.status !== 0) throw new Error(`astryx generate (run B) failed:\n${b.out}`);
      const hA = hashTree('examples/astryx/.pin-a');
      const hB = hashTree('examples/astryx/.pin-b');
      if (hA !== hB) throw new Error(`astryx generate is NOT byte-stable: ${hA} != ${hB}`);
      // 2. a committed Figma sync script compiles (referee): its COMPONENTS
      //    payload parses to the Badge set with the full 14-tone variant grid.
      const comp = parseSyncComponent(
        readFileSync(path.join(SCRATCH, 'examples', 'astryx', 'figma', 'badge.figma.js'), 'utf8'),
      );
      if (comp.setName !== 'Badge' || comp.contractId !== 'astryx.badge' || comp.isSet !== true) {
        throw new Error(`badge figma set identity wrong: ${JSON.stringify({ s: comp.setName, c: comp.contractId, i: comp.isSet })}`);
      }
      if ((comp.variants ?? []).length !== 14) {
        throw new Error(`badge figma compiled ${(comp.variants ?? []).length} variants, expected 14`);
      }
      console.log(
        `astryx-dev-journey: 10 flagship contracts → generator byte-stable × 2 runs (${hA.slice(0, 12)}…); ` +
          `committed badge.figma.js compiles to the 14-variant Badge set (referee)`,
      );
    },
  },
  {
    // spec 006 (R14 #4, contracts/region-proof.md): the --regions flag on
    // page-parity's cli.ts is STRICTLY ADDITIVE. Reuses the committed
    // one-pixel fixture pair (copied into scratch as part of `extract/`) —
    // no new PNGs, only different --regions rectangles (region-proof.md §6).
    id: 'pages-compare-regions-additive',
    claim: 'C1-determinism',
    run: () => {
      const CLI = 'extract/figma/page-parity/cli.ts';
      const before = 'extract/figma/page-parity/fixtures/one-pixel/before';
      const after = 'extract/figma/page-parity/fixtures/one-pixel/after';
      const outNoFlag = 'evals/.scratch-out/pages-regions/no-flag';
      const outInside = 'evals/.scratch-out/pages-regions/inside';
      const outOutside = 'evals/.scratch-out/pages-regions/outside';
      const regionsInsidePath = 'evals/.scratch-out/pages-regions/inside.regions.json';
      const regionsOutsidePath = 'evals/.scratch-out/pages-regions/outside.regions.json';
      mkdirSync(path.join(SCRATCH, 'evals', '.scratch-out', 'pages-regions'), { recursive: true });
      writeFileSync(path.join(SCRATCH, regionsInsidePath), JSON.stringify({ 'maquette-a': { x: 5, y: 5, w: 10, h: 10 } }));
      writeFileSync(path.join(SCRATCH, regionsOutsidePath), JSON.stringify({ 'maquette-a': { x: 50, y: 50, w: 10, h: 10 } }));

      // 1. Byte-identity WITHOUT --regions: raw verdict.json text carries none
      //    of the 4 new keys (JSON.stringify omits undefined-valued props).
      const rNoFlag = run(TSX, [CLI, '--before', before, '--after', after, '--out', outNoFlag]);
      if (rNoFlag.status !== 1) throw new Error(`no-flag run: expected exit 1, got ${rNoFlag.status}\n${rNoFlag.out}`);
      const jsonNoFlag = readFileSync(path.join(SCRATCH, outNoFlag, 'verdict.json'), 'utf8');
      if (jsonNoFlag.includes('"region"') || jsonNoFlag.includes('regionDiffCount')) {
        throw new Error(`verdict.json (no --regions) unexpectedly carries a region key:\n${jsonNoFlag}`);
      }

      // 2. region-inside: rectangle CONTAINS the flipped pixel (10,7).
      const rInside = run(TSX, [CLI, '--before', before, '--after', after, '--out', outInside, '--regions', regionsInsidePath]);
      if (rInside.status !== 1) throw new Error(`region-inside run: expected exit 1, got ${rInside.status}\n${rInside.out}`);
      const docInside = JSON.parse(readFileSync(path.join(SCRATCH, outInside, 'verdict.json'), 'utf8'));
      const entryInside = docInside.maquettes.find((m: { maquette: string }) => m.maquette === 'maquette-a');
      if (entryInside.regionDiffCount !== 1 || entryInside.outsideDiffCount !== 0) {
        throw new Error(`region-inside: expected regionDiffCount 1 / outsideDiffCount 0, got ${JSON.stringify(entryInside)}`);
      }

      // 3. region-outside: rectangle EXCLUDES the flipped pixel — the mirror.
      const rOutside = run(TSX, [CLI, '--before', before, '--after', after, '--out', outOutside, '--regions', regionsOutsidePath]);
      if (rOutside.status !== 1) throw new Error(`region-outside run: expected exit 1, got ${rOutside.status}\n${rOutside.out}`);
      const docOutside = JSON.parse(readFileSync(path.join(SCRATCH, outOutside, 'verdict.json'), 'utf8'));
      const entryOutside = docOutside.maquettes.find((m: { maquette: string }) => m.maquette === 'maquette-a');
      if (entryOutside.regionDiffCount !== 0 || entryOutside.outsideDiffCount !== 1) {
        throw new Error(`region-outside: expected regionDiffCount 0 / outsideDiffCount 1, got ${JSON.stringify(entryOutside)}`);
      }

      console.log(
        'pages-compare-regions-additive: no-flag run carries zero region keys (byte-identity); ' +
          'region-inside → regionDiffCount 1/outsideDiffCount 0; region-outside → regionDiffCount 0/outsideDiffCount 1',
      );
    },
  },
  // RE-ANIMATED (spec 006, 2026-07-26): was `detect-figma-missing-nested-instance`
  // in evals/legacy-cases.ts (quarantined at the Piqueray reconversion — no
  // composite existed to exercise it). Piqueray now ships ds.google-reviews
  // (GoogleReviews) composing ds.review-card (ReviewCard) via a `component`
  // ref in its anatomy — the exact re-enable condition. Body is the same
  // shape as the original (edit the snapshot's nestedInstances, expect a
  // figma/behind finding), re-pointed onto the real names.
  //
  // UPDATED (T076a, 2026-07-26): the two masters were renamed to their
  // French canvas convention (ReviewCard → Review-card, GoogleReviews →
  // Avis Google) — the LIVE snapshot now carries those names. The set is
  // still found by CONTRACT NAME here on purpose (not by key) — this is a
  // parked, deliberately-fragile probe of the exact join parity/diff.ts's
  // outer contract⟷set lookup no longer uses (that lookup already prefers
  // componentSetKey; see the `nestedInstanceName` helper added alongside
  // this fix). If this literal ever needs touching again after a future
  // rename, that itself is the signal that some remaining lookup regressed
  // to name-matching — check parity/diff.ts's `set` and `nestedInstanceName`
  // resolution first (B5 backlog: same failure class in core/emit-figma-
  // script.ts's findComponentByName).
  {
    id: 'detect-figma-missing-nested-instance',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        const set = s.sets.find((x: any) => x.name === 'Avis Google');
        set.nestedInstances = (set.nestedInstances ?? []).filter((n: string) => n !== 'Review-card');
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma', 'behind', 'GoogleReviews.Review-card');
    },
  },
  {
    // T064 (spec 006) RÉÉCRIT le 2026-08-18 sur décision owner. L'ancien cas
    // pinnait l'inverse de celui-ci : que l'exclusivité photo/initiale était
    // une CONVENTION que le schéma ne pouvait pas tenir (deux BOOLEAN
    // indépendants, `visibleWhen` sans négation), et que la description du
    // contrat ne devait donc pas prétendre l'imposer (Constitution V).
    //
    // L'owner a supprimé les deux bascules : l'avatar est maintenant UNE
    // variante `avatar` à deux valeurs, donc l'exclusivité est STRUCTURELLE —
    // l'état « les deux à la fois » n'a plus de représentation possible. Ce
    // cas garde la même exigence d'honnêteté, tournée dans l'autre sens : il
    // refuse le retour des deux booléens, et vérifie que les deux parts sont
    // gardées par la MÊME prop testée sur deux valeurs différentes.
    id: 'review-card-avatar-exclusivity-is-schema-enforced',
    claim: 'C3-detection',
    run: () => {
      const byId = new Map(
        readdirSync(path.join(ROOT, 'contracts'))
          .filter((f) => f.endsWith('.contract.json'))
          .map((f) => ContractSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'contracts', f), 'utf8'))))
          .map((c) => [c.id, c]),
      );
      const card = byId.get('ds.review-card');
      if (!card) throw new Error('contracts/review-card.contract.json missing ds.review-card');
      for (const disparu of ['initialeVisible', 'photo']) {
        if (card.props.some((p) => p.name === disparu)) {
          throw new Error(`ds.review-card a retrouvé la prop booléenne "${disparu}" — l'exclusivité redeviendrait une convention`);
        }
      }
      const avatar = card.props.find((p) => p.name === 'avatar');
      if (!avatar) throw new Error('ds.review-card n\'a pas de prop `avatar`');
      const valeurs = typeof avatar.type === 'object' && 'enum' in avatar.type ? avatar.type.enum : null;
      if (!valeurs || valeurs.length !== 2 || !valeurs.includes('Initiale') || !valeurs.includes('Photo')) {
        throw new Error(`\`avatar\` doit être un enum Initiale|Photo, lu : ${JSON.stringify(avatar.type)}`);
      }
      const icons = new Map(
        readdirSync(path.join(ROOT, 'assets', 'icons'))
          .filter((f) => f.endsWith('.svg'))
          .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', 'icons', f), 'utf8').trim()]),
      );
      const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
      const tokenInv = tokenInventoryFromJson([
        read('tokens/primitives.tokens.json'),
        read('tokens/semantic.tokens.json'),
        read('tokens/modes/semantic.light.tokens.json'),
      ]);
      const { tsx } = coreEmitReact(card, { tokens: tokenInv, icons, contracts: byId });
      // Les deux gardes doivent tester la MÊME prop sur deux valeurs distinctes :
      // c'est ce qui rend l'état double irreprésentable, au lieu de reposer sur
      // la discipline de l'appelant.
      const gardes = [...tsx.matchAll(/\{(avatar[^?\n]*)\?\s*\(/g)].map((m) => m[1]);
      if (gardes.length !== 2) {
        throw new Error(`attendu 2 gardes sur \`avatar\`, trouvé ${gardes.length} : ${JSON.stringify(gardes)}`);
      }
      const cible = (g: string) => (g.includes("'Initiale'") ? 'Initiale' : g.includes("'Photo'") ? 'Photo' : null);
      const cibles = gardes.map(cible);
      if (new Set(cibles).size !== 2 || cibles.includes(null)) {
        throw new Error(`les deux gardes doivent viser des valeurs différentes, lu : ${JSON.stringify(gardes)}`);
      }
      console.log('review-card-avatar-exclusivity-is-schema-enforced: les deux booléens ont disparu; `avatar` est un enum Initiale|Photo et les deux parts sont gardées par la même prop sur deux valeurs distinctes — l\'état « deux avatars » n\'a plus de représentation, l\'exclusivité n\'est plus une convention');
    },
  },
  {
    // T065 (spec 006, US3): ds.google-reviews' `avis` prop is the v12 repeat
    // collection (repeat.sample + component:ds.review-card, R8/T033) — React
    // MAPS THE LIVE ARRAY (per-item props flow through), while the static
    // surfaces (html, react-inline) and the canvas sync script all render the
    // contract's OBSERVED `sample` instead (never the real runtime content —
    // the meter discipline, core/emit-{react,html,react-inline,figma-script}.ts
    // repeat branches). `avis` left `undefined` must render nothing on the
    // React surface (the arrayOf discipline: never a silent `[]`). The canvas
    // leg of this claim is proven by scripts/deterministic-roundtrip.mjs
    // itself ("the repeat+component produced 5 nested instances in
    // groupeCartes" — same GoogleReviews contract, T060); this eval covers
    // the two code emitters + the live-array/undefined split that the
    // roundtrip script does not exercise.
    id: 'google-reviews-repeat-renders-sample-on-static-surfaces',
    claim: 'C3-detection',
    run: () => {
      const byId = new Map(
        readdirSync(path.join(ROOT, 'contracts'))
          .filter((f) => f.endsWith('.contract.json'))
          .map((f) => ContractSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'contracts', f), 'utf8'))))
          .map((c) => [c.id, c]),
      );
      const section = byId.get('ds.google-reviews');
      if (!section) throw new Error('contracts/google-reviews.contract.json missing ds.google-reviews');
      const icons = new Map(
        readdirSync(path.join(ROOT, 'assets', 'icons'))
          .filter((f) => f.endsWith('.svg'))
          .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', 'icons', f), 'utf8').trim()]),
      );
      // 1. React: maps the LIVE array by name, `undefined` renders nothing
      // (the arrayOf discipline: avis?.map, never a plain avis.map).
      const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
      const tokenInv = tokenInventoryFromJson([
        read('tokens/primitives.tokens.json'),
        read('tokens/semantic.tokens.json'),
        read('tokens/modes/semantic.light.tokens.json'),
      ]);
      const { tsx } = coreEmitReact(section, { tokens: tokenInv, icons, contracts: byId });
      if (!/avis\?\.map\(\(item, index\) => \(<ReviewCard key=\{index\}[^)]*item\.auteur[^)]*\/>\)\)/.test(tsx)) {
        throw new Error(`emitted TSX does not map the live "avis" array onto <ReviewCard>:\n${tsx.slice(0, 1200)}`);
      }
      // 2. Static HTML surface: renders the OBSERVED sample (5 records),
      // never a live array — five distinct sample dates ("il y a 2 mois" …
      // "il y a 6 mois") must all appear verbatim in the markup.
      const { html } = coreEmitHtml(section, { tokens: tokenInv, icons, contracts: byId });
      const sample = (section.anatomy.root.parts!.cartes as SchemaPart).parts!.groupeCartes.parts!.carte.repeat!.sample as Array<Record<string, unknown>>;
      if (sample.length !== 5) throw new Error(`expected 5-record sample, got ${sample.length}`);
      for (const rec of sample) {
        const date = String(rec.date);
        if (!html.includes(date)) throw new Error(`static html surface missing sample record date "${date}" — sample not rendered`);
      }
      // 3. Inline-React surface: same fixed-instance rendering, executed via
      // a spawned tsx probe (mirrors react-hyphenated-part-names-execute —
      // emit-react-inline.ts is not re-exported through harness.ts).
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { emitReactInline } from './core/emit-react-inline.ts';
        const byId = new Map(
          fs.readdirSync('contracts').filter((f) => f.endsWith('.contract.json'))
            .map((f) => ContractSchema.parse(JSON.parse(fs.readFileSync('contracts/' + f, 'utf8'))))
            .map((c) => [c.id, c]),
        );
        const icons = new Map(
          fs.readdirSync('assets/icons').filter((f) => f.endsWith('.svg'))
            .map((f) => [f.replace(/\\.svg$/, ''), fs.readFileSync('assets/icons/' + f, 'utf8').trim()]),
        );
        const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        // emitReactInline wants the RAW TokenTreeInput shape (primitives/
        // semantic/light/dark/brands), not the flat Set from
        // tokenInventoryFromJson (that's for emitReact/emitHtml only).
        const tokens = {
          primitives: read('tokens/primitives.tokens.json'),
          semantic: read('tokens/semantic.tokens.json'),
          light: read('tokens/modes/semantic.light.tokens.json'),
          dark: {},
          brands: {},
        };
        const section = byId.get('ds.google-reviews');
        const { tsx } = emitReactInline(section, { tokens, icons, contracts: byId, mode: 'light' });
        console.log(tsx.includes('il y a 2 mois') && tsx.includes('il y a 6 mois') ? 'INLINE-SAMPLE-OK' : 'INLINE-SAMPLE-MISSING');
      `]);
      if (probe.status !== 0 || !probe.out.includes('INLINE-SAMPLE-OK')) {
        throw new Error(`react-inline surface did not render the observed sample:\n${probe.out.slice(0, 800)}`);
      }
      console.log('google-reviews-repeat-renders-sample-on-static-surfaces: React maps the live "avis" array (avis?.map, undefined renders nothing); html + react-inline both render the contract\'s 5-record OBSERVED sample verbatim, never the real runtime content — the canvas leg of the same claim is proven by scripts/deterministic-roundtrip.mjs (5 nested instances in groupeCartes)');
    },
  },
  {
    // T066 (spec 006, US3): ds.review-card's `avatarPhoto` part (element:
    // "img") is the open A5 gap (R6) — a real photo pixel exists only as an
    // out-of-contract IMAGE-fill override on the 8 adopted occurrences,
    // never a designer-drawn master state. On the canvas the SAME part
    // compiles to the standard #D9D9D9 placeholder wash (Round 5,
    // core/emit-figma-script.ts:2026-2034, `spec.imgPlaceholder = true`),
    // and that fact is REPORTED, never hidden: it joins hasPreviewOnlyFacts
    // (:2426-2428) which forces the component's one-line caption to carry
    // the trailing † (:2432-2451) — the single canvas trace the constitution
    // requires for a code-only fact (Part D). This pins BOTH halves: the
    // compiled placeholder wash AND the † on the description, so the A5 gap
    // stays a NAMED limit rather than a silent one.
    id: 'img-part-canvas-placeholder-named',
    claim: 'C3-detection',
    run: () => {
      const byId = new Map(
        readdirSync(path.join(ROOT, 'contracts'))
          .filter((f) => f.endsWith('.contract.json'))
          .map((f) => ContractSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'contracts', f), 'utf8'))))
          .map((c) => [c.id, c]),
      );
      const card = byId.get('ds.review-card');
      if (!card) throw new Error('contracts/review-card.contract.json missing ds.review-card');
      const photoPart = (card.anatomy.root.parts!.entete as SchemaPart).parts!.profil.parts!.avatarPhoto;
      if (photoPart.element !== 'img') throw new Error('avatarPhoto is no longer an <img> part — the A5 proof must be re-derived');
      const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
      const engine = createFigmaEngine({
        tokens: {
          primitives: read('tokens/primitives.tokens.json'),
          semantic: read('tokens/semantic.tokens.json'),
          light: read('tokens/modes/semantic.light.tokens.json'),
          dark: {},
          brands: { default: {} },
        },
        icons: new Map(
          readdirSync(path.join(ROOT, 'assets', 'icons'))
            .filter((f) => f.endsWith('.svg'))
            .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', 'icons', f), 'utf8').trim()]),
        ),
        iconComponents: iconComponentsFromRegistry(read('contracts/icons.registry.json') as { icons: IconRegistryEntry[] }),
      });
      const script = engine.buildComponentScript(card, byId);
      const comp = JSON.parse(script.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      const findByName = (spec: any, name: string): any => {
        if (spec.name === name) return spec;
        for (const c of spec.children ?? []) {
          const hit = findByName(c, name);
          if (hit) return hit;
        }
        return null;
      };
      // 2026-08-18 : ds.review-card est devenu un set de deux variantes
      // (Avatar=Initiale | Avatar=Photo). `visibleWhen` se résout PAR VARIANTE
      // côté canevas, donc la part photo n'existe que dans la variante Photo —
      // lire `variants[0]` en dur cherchait la preuve A5 dans la seule variante
      // qui, par construction, ne peut pas la porter.
      const photoSpec = comp.variants
        .map((v: any) => findByName(v.spec, 'avatarPhoto'))
        .find((hit: any) => hit);
      if (!photoSpec) {
        throw new Error(`aucune variante ne compile un nœud "avatarPhoto" (variantes : ${comp.variants.map((v: any) => v.name).join(', ')}) :\n${JSON.stringify(comp.variants[0].spec, null, 2).slice(0, 1200)}`);
      }
      if (photoSpec.imgPlaceholder !== true) throw new Error(`avatarPhoto must compile with imgPlaceholder:true, got: ${JSON.stringify(photoSpec)}`);
      const grey = photoSpec.lits?.fillColor;
      if (!grey || Math.abs(grey.r - 217 / 255) > 0.001 || Math.abs(grey.g - 217 / 255) > 0.001 || Math.abs(grey.b - 217 / 255) > 0.001) {
        throw new Error(`avatarPhoto must carry the standard #D9D9D9 placeholder wash, got: ${JSON.stringify(grey)}`);
      }
      if (!comp.description.includes('†')) {
        throw new Error(`ds.review-card has a code-only fact (imgPlaceholder) — its description must carry the † footnote, got: ${JSON.stringify(comp.description)}`);
      }

      // --- 017 (T036, FR-010/FR-010a) — the dagger stops being MUTE ---------
      // The mark was already there on all 9 image-bearing components; what was
      // missing was the SENTENCE. One clause, on the SAME line, dagger still
      // last — the owner's 2026-07-19 "one line only" directive holds, and a
      // clause on the same line does not reopen it (a return to paragraphs
      // would). What HAPPENS to the photo at regeneration is deliberately NOT
      // said here: the caption says what the frame IS, the docs say what
      // happens to the photo.
      const CLAUSE = ' · image frame: runtime slot, photo shown is a mockup sample';
      if (!comp.description.includes(CLAUSE)) {
        throw new Error(`a component with an img part must carry the image-frame clause ${JSON.stringify(CLAUSE)} — got: ${JSON.stringify(comp.description)}`);
      }
      if (comp.description.includes('\n')) {
        throw new Error(`the component caption must stay ONE line (owner directive 2026-07-19) — got: ${JSON.stringify(comp.description)}`);
      }
      if (!comp.description.endsWith(`${CLAUSE} †`)) {
        throw new Error(`the dagger must stay LAST, after the clause — got: ${JSON.stringify(comp.description)}`);
      }
      // A component WITHOUT an img part keeps its caption to the character.
      const plain = byId.get('ds.button');
      if (!plain) throw new Error('contracts/button.contract.json missing ds.button');
      const plainComp = JSON.parse(engine.buildComponentScript(plain, byId).match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      if (plainComp.description.includes('image frame')) {
        throw new Error(`ds.button has no img part — its caption must be unchanged, got: ${JSON.stringify(plainComp.description)}`);
      }

      // --- 017 (T036a) — THE FIRST EVAL IN THIS REPO TO READ docs/ -----------
      // Measured 2026-08-06: NOT ONE case in this file read `docs/` (the single
      // `docs/` occurrence was a comment at :18; every .md a case reads is a
      // GENERATED report outside docs/). So the repo's own rule — "no capability
      // sentence lands in a doc before an eval backs it" — was, on the
      // documentation side, held up by nothing at all. A doc that asserts with
      // no check behind it is exactly the defect this spec repairs elsewhere.
      //
      // The two copies below are pinned BYTE-FOR-BYTE. Editing the canvas clause
      // without the docs — or the reverse — reddens here. That is the only
      // mechanism preventing the two from drifting apart in silence.
      const MATRIX_IMAGE_ROW =
        '| `background-image: url()` (img parts) | "This frame is a runtime image slot — the photo you see is a mockup sample. The coded component receives its image at runtime." |';
      const matrix = readFileSync(path.join(ROOT, 'docs', 'FIGMA-CAPABILITY-MATRIX.md'), 'utf8');
      if (!matrix.includes(MATRIX_IMAGE_ROW)) {
        throw new Error(
          'docs/FIGMA-CAPABILITY-MATRIX.md § (b) must carry the image row, byte-for-byte:\n  ' + MATRIX_IMAGE_ROW +
            '\n(the canvas clause and the annotation copy are two halves of one answer — they may not drift apart)',
        );
      }
      // The addendum is what makes that row COHERENT: §(b) is reserved for
      // CARRY-CODE-ONLY channels, while row 91 verdicts the image CARRY-BOTH.
      // Its absence would leave the row looking like a filing error instead of
      // a named transport gap.
      for (const needle of ['Addendum, 2026-08-06 (spec 017)', '`— (image content not bindable)`']) {
        if (!matrix.includes(needle)) {
          throw new Error(`docs/FIGMA-CAPABILITY-MATRIX.md must keep the A5 addendum — missing: ${JSON.stringify(needle)}`);
        }
      }
      const handoff = readFileSync(path.join(ROOT, 'docs', 'handoff', '08-status-what-doesnt-work.md'), 'utf8');
      const HANDOFF_QUESTION = '## 6. What happens to an image at regeneration? — ANSWERED, with one gap still open';
      if (!handoff.includes(HANDOFF_QUESTION)) {
        throw new Error(
          `docs/handoff/08-status-what-doesnt-work.md must answer the regeneration question, byte-for-byte:\n  ${HANDOFF_QUESTION}`,
        );
      }
      if (!handoff.includes('docs/FIGMA-CAPABILITY-MATRIX.md`, section')) {
        throw new Error('the handoff answer must POINT at the capability matrix — the matrix is the authoritative source, the handoff is the entry point');
      }
      console.log(
        'img-part-canvas-placeholder-named: avatarPhoto (element:"img") compiles to imgPlaceholder:true + the standard #D9D9D9 wash on canvas; the caption carries the image-frame clause on ONE line with the † still last, and a component without an img part is untouched; and — a first for this repo — the two documentation copies (capability-matrix row + its A5 addendum, handoff §6 + its pointer) are pinned BYTE-FOR-BYTE, so canvas copy and doc copy cannot drift apart in silence',
      );
    },
  },
  {
    // Regression: MemberPicture was adopted with a purely structural anatomy,
    // so every generated surface collapsed its root to 0×0. The contract must
    // carry the measured 364px circle and both stacked image planes; the IMAGE
    // pixels themselves remain the named A5 technical placeholder, never a
    // fabricated Piqueray colour or a silent loss.
    id: 'member-picture-fixed-circle-and-named-a5-placeholder',
    claim: 'C2-refusal',
    run: () => {
      const byId = new Map(
        readdirSync(path.join(ROOT, 'contracts'))
          .filter((f) => f.endsWith('.contract.json'))
          .map((f) => ContractSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'contracts', f), 'utf8'))))
          .map((c) => [c.id, c]),
      );
      const member = byId.get('ds.member-picture');
      if (!member) throw new Error('contracts/member-picture.contract.json missing ds.member-picture');
      const read = (p: string) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
      const tokens = {
        primitives: read('tokens/primitives.tokens.json'),
        semantic: read('tokens/semantic.tokens.json'),
        light: read('tokens/modes/semantic.light.tokens.json'),
        dark: {},
        brands: { default: {} },
      };
      const tokenInv = tokenInventoryFromJson([tokens.primitives, tokens.semantic, tokens.light]);
      const icons = new Map(
        readdirSync(path.join(ROOT, 'assets', 'icons'))
          .filter((f) => f.endsWith('.svg'))
          .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(ROOT, 'assets', 'icons', f), 'utf8').trim()]),
      );
      const { css } = coreEmitReact(member, { tokens: tokenInv, icons, contracts: byId });
      const engine = createFigmaEngine({ tokens, icons });
      const script = engine.buildComponentScript(member, byId);
      const compiled = JSON.parse(script.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      const findByName = (spec: any, name: string): any =>
        spec.name === name ? spec : (spec.children ?? []).map((c: any) => findByName(c, name)).find(Boolean);
      const assertProjection = (component: any): void => {
        if (component.variants.length !== 2) throw new Error(`MemberPicture must compile two states, got ${component.variants.length}`);
        for (const variant of component.variants) {
          const root = variant.spec;
          const rootWidth = root.fixedWidth?.px ?? root.lits?.width;
          const rootHeight = root.fixedHeight?.px ?? root.lits?.height;
          if (rootWidth !== 364 || rootHeight !== 364) {
            throw new Error(`MemberPicture ${variant.name} root is ${rootWidth ?? 0}×${rootHeight ?? 0}, expected 364×364 — refusing a collapsed root`);
          }
          if (root.lits?.radius !== 500) throw new Error(`MemberPicture ${variant.name} root lost its 500px circular radius`);
          const previewBase = root.lits?.fillColor;
          const generic = 217 / 255;
          if (
            !previewBase ||
            Math.abs(previewBase.r - generic) > 0.001 ||
            Math.abs(previewBase.g - generic) > 0.001 ||
            Math.abs(previewBase.b - generic) > 0.001
          ) {
            throw new Error(`MemberPicture ${variant.name} root lost its explicitly named technical #D9D9D9 A5 preview base`);
          }
          for (const layerName of ['funIa', 'normal']) {
            const layer = findByName(root, layerName);
            if (!layer) throw new Error(`MemberPicture ${variant.name} is missing ${layerName}`);
            const width = layer.fixedWidth?.px ?? layer.lits?.width;
            const height = layer.fixedHeight?.px ?? layer.lits?.height;
            if (width !== 364 || height !== 364) throw new Error(`MemberPicture ${variant.name}/${layerName} is ${width ?? 0}×${height ?? 0}, expected 364×364`);
            if (layer.lits?.radius !== 500 || layer.insetOverlay !== true) throw new Error(`MemberPicture ${variant.name}/${layerName} must be a 500px absolute inset-0 circle`);
            const fallback = layer.lits?.fillColor;
            if (
              layer.imgPlaceholder !== true ||
              !fallback ||
              Math.abs(fallback.r - generic) > 0.001 ||
              Math.abs(fallback.g - generic) > 0.001 ||
              Math.abs(fallback.b - generic) > 0.001
            ) {
              throw new Error(`MemberPicture ${variant.name}/${layerName} lost the generic #D9D9D9 A5 image placeholder`);
            }
          }
          const normal = findByName(root, 'normal');
          const expectedOpacity = variant.name.includes('Survol') ? 0 : 1;
          if (normal.opacity !== expectedOpacity) throw new Error(`MemberPicture ${variant.name}/normal opacity is ${normal.opacity}, expected ${expectedOpacity}`);
        }
      };
      assertProjection(compiled);
      const rootParts = member.anatomy.root.parts ?? {};
      for (const [partName, part] of Object.entries(rootParts)) {
        if (part.literals?.['background-color'] !== undefined || part.tokens?.['background-color'] !== undefined) {
          throw new Error(`MemberPicture/${partName} carries its own background fill — A5 must come from the engine's generic img fallback`);
        }
      }
      // Compile an actually broken CONTRACT, rather than mutating the already
      // compiled spec. This is the pre-fix MemberPicture failure class: with
      // no root geometry, the absolute children contribute no intrinsic size
      // and the generated root collapses to 0×0.
      // 015: root's width/height moved from literals to tokens (geometry-
      // rides-tokens conversion). v1.3.0 (projection-repair, 2026-08-12):
      // they moved AGAIN — the fluid square rides layout.referenceWidth +
      // layout.aspectRatio (planes are inset-0 and follow the parent).
      // Delete from the field that NOW carries the geometry, or this
      // constructs a contract identical to `member` and refuses nothing.
      const collapsedContract = ContractSchema.parse(JSON.parse(JSON.stringify(member)));
      const collapsedLayout = collapsedContract.anatomy.root.layout as
        | { referenceWidth?: number; aspectRatio?: number }
        | undefined;
      delete collapsedLayout?.referenceWidth;
      delete collapsedLayout?.aspectRatio;
      delete collapsedContract.anatomy.root.tokens?.width;
      delete collapsedContract.anatomy.root.tokens?.height;
      const collapsedById = new Map(byId);
      collapsedById.set(collapsedContract.id, collapsedContract);
      const collapsedScript = engine.buildComponentScript(collapsedContract, collapsedById);
      const collapsed = JSON.parse(collapsedScript.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];
      let refused = false;
      try { assertProjection(collapsed); } catch (err) { refused = String(err).includes('collapsed root'); }
      if (!refused) throw new Error('A MemberPicture contract that generates a 0×0 root was accepted');
      for (const required of [
        // 015: root/funIa/normal width+height moved from literal px to
        // per-part tokens (geometry-rides-tokens). v1.3.0 (projection-repair,
        // 2026-08-12): the fixed 364 tokens gave way to the fluid square —
        // the root rides width:100% + aspect-ratio:1 (referenceWidth is a
        // canvas authoring size only), each plane rides width/height:100%
        // inside its inset-0 overlay.
        '.root {', 'width: 100%;', 'aspect-ratio: 1;',
        'border-radius: 500px;', 'background-color: #d9d9d9;', 'position: relative;',
        '.etat-defaut {', '.etat-survol {', 'overflow: hidden;',
        '.funIa {', '.normal {', 'height: 100%;',
        'position: absolute;', 'top: 0px;', 'right: 0px;', 'bottom: 0px;', 'left: 0px;',
        'transition: opacity 300ms;',
      ]) {
        if (!css.toLowerCase().includes(required.toLowerCase())) {
          throw new Error(`MemberPicture CSS is missing ${JSON.stringify(required)}`);
        }
      }
      if (!/\.etat-defaut \.normal \{[\s\S]*?opacity: 1;/.test(css)) throw new Error('MemberPicture defaut must keep normal at opacity 1');
      if (!/\.etat-survol \.normal \{[\s\S]*?opacity: 0;/.test(css)) throw new Error('MemberPicture survol must set normal to opacity 0');
      if (!member.description.includes('A5') || !member.description.includes('†') || !compiled.description.includes('†')) {
        throw new Error(`MemberPicture image loss must remain named A5 in the contract and marked † on the canvas, got contract=${JSON.stringify(member.description)}, canvas=${JSON.stringify(compiled.description)}`);
      }
      console.log('member-picture-fixed-circle-and-named-a5-placeholder: rejects a 0×0 root; both 364×364 circular inset layers stack with normal opacity 1→0 and a 300ms transition; unavailable IMAGE pixels render only as the generic technical A5 placeholder, explicitly named (not a Piqueray colour or pixel-parity claim)');
    },
  },
  // ---- 014 — mesure juste et triage complet ---------------------------------
  {
    id: 'organism-audit-case-reference-provenance',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/organism-audit-case-reference-check.ts']);
      if (r.status !== 0) throw new Error(`Organism-audit case-reference provenance check failed:\n${r.out}`);
    },
  },
  {
    id: 'triage-six-value-vocabulary',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/triage-vocabulary-check.ts']);
      if (r.status !== 0) throw new Error(`Six-value cause vocabulary check failed:\n${r.out}`);
    },
  },
  {
    id: 'measure-gate-fail-closed-policy',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/measure-gate-policy-check.ts']);
      if (r.status !== 0) throw new Error(`measure-gate fail-closed policy check failed:\n${r.out}`);
    },
  },
  {
    id: 'geometry-gate-policy-check',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/geometry-gate-policy-check.ts']);
      if (r.status !== 0) throw new Error(`geometry-gate fail-closed policy check failed:\n${r.out}`);
    },
  },
  {
    id: 'gradient-literal-channel',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/gradient-literal-channel.ts']);
      if (r.status !== 0) throw new Error(`background-image gradient literal channel check failed:\n${r.out}`);
    },
  },
  // 015/US2 (FR-004) — T013 shipped the border-box rule into emit-react with
  // receipts but no fixture; the only box-sizing assertion in the suite was on
  // the CANVAS stylesheet. Added in the Phase 7 review so the README claim has
  // an eval behind it (Claims Rule). It earned its keep immediately: its first
  // run caught the multi-root emit-html gap now registered as DW-015-001.
  {
    id: 'react-box-model-border-box',
    claim: 'C1-determinism',
    run: () => {
      const r = run(TSX, ['evals/fixtures/react-box-model-border-box.ts']);
      if (r.status !== 0) throw new Error(`React box-model (border-box) check failed:\n${r.out}`);
    },
  },
  // tinyspec select-option-emit — DW-014-001's standing eval: a part that IS
  // the <select> (ds.select's `valeur` authors element: "select") wraps its
  // text in a bare <option> on the html surface, both branches (content and
  // text) — the React mirror native-checkbox-and-select-render-correctly
  // pins. Red first against the bare-child emission behind 014's empty
  // select capture (maskCoveragePct 0, receipt select-exclusion.json).
  {
    id: 'emit-html-select-option-text',
    claim: 'C1-determinism',
    run: () => {
      const r = run(TSX, ['evals/fixtures/emit-html-select-option-text.ts']);
      if (r.status !== 0) throw new Error(`emit-html select option-text check failed:\n${r.out}`);
    },
  },
  // 015/D10 (FR-009) — the exact scenario reproduced RED in
  // preservation-013-rouge.txt (T037): a re-extraction/merge silently
  // clobbers a 013 hand-set correction. `checkPreservation` (T038,
  // extract/geometry-gate/preservation.ts) must refuse both shapes —
  // a reverted value AND a dropped field — where the toolchain alone
  // (build + parity) stayed clean.
  {
    id: 'icon-tokens-by-prop-svg-mirror',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['evals/fixtures/icon-tokens-by-prop-svg-mirror.ts']);
      if (r.status !== 0) throw new Error(`Icon tokensByProp svg-mirror check failed:\n${r.out}`);
    },
  },
  {
    id: 'preservation-013-clobber-detected',
    claim: 'C3-detection',
    run: () => {
      resetScratch();
      // 015 Phase 6 (T057) converted these sites literals->tokens on the real
      // footer.contract.json — the clobber simulation now mutates `tokens`,
      // not `literals` (checkPreservation's own mirrorToTokenPointer already
      // follows a pure conversion; this fixture just needs to match where the
      // values live today).
      editJson('contracts/footer.contract.json', (c) => {
        c.anatomy.root.tokens['padding-top'] = '{space.0}'; // reverted (resolves to a different px than expected)
        delete c.anatomy.root.tokens['padding-left']; // dropped
        delete c.anatomy.root.tokens['padding-right']; // dropped
      });
      // The toolchain alone must NOT catch it (this IS the gap T038 closes).
      if (generate().status !== 0) throw new Error('generate must still succeed on a schema-valid, geometrically-wrong contract');
      if (parity().status !== 0) throw new Error('parity is not the instrument for this class of drift — it must stay clean here');

      const preservationCheck = run(TSX, [
        'extract/geometry-gate/run.ts',
        '--preservation',
        path.join(ROOT, 'specs/015-geometrie-gouvernee/fixtures/corrections-013.json'),
        '--json',
      ]);
      if (preservationCheck.status === 0) {
        throw new Error(`checkPreservation must refuse the clobbered contract, but exited 0:\n${preservationCheck.out}`);
      }
      const result = JSON.parse(preservationCheck.out);
      const clobbered = result.findings.filter((f: { state: string }) => f.state === 'clobbered');
      if (clobbered.length !== 3) {
        throw new Error(`expected exactly 3 clobbered entries (1 reverted + 2 dropped), got ${clobbered.length}: ${JSON.stringify(clobbered)}`);
      }
    },
  },
  // ---- 020 — readiness Figma–contrat des 11 sections -----------------------
  // Each check is hermetic and adversarial.  The live Figma/owner gates remain
  // explicit runtime inputs; the checks prove that their absence cannot become
  // a green readiness result.
  {
    id: 'figma-readiness-foundation',
    claim: 'C2-refusal',
    run: () => {
      const r = run(TSX, ['evals/fixtures/figma-readiness/foundation-check.ts']);
      if (r.status !== 0) throw new Error(`Readiness foundation check failed:\n${r.out}`);
    },
  },
  {
    id: 'figma-readiness-timeline-and-candidates',
    claim: 'C2-refusal',
    run: () => {
      for (const fixture of ['timeline-check.ts', 'candidate-ranking-check.ts']) {
        const r = run(TSX, [`evals/fixtures/figma-readiness/${fixture}`]);
        if (r.status !== 0) throw new Error(`Readiness ${fixture} failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'figma-readiness-owner-gates',
    claim: 'C2-refusal',
    run: () => {
      for (const fixture of ['owner-gate-check.ts', 'owner-gate-refusal-check.ts']) {
        const r = run(TSX, [`evals/fixtures/figma-readiness/${fixture}`]);
        if (r.status !== 0) throw new Error(`Readiness ${fixture} failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'figma-readiness-diagnosis-and-impact',
    claim: 'C3-detection',
    run: () => {
      for (const fixture of ['findings-check.ts', 'impact-graph-check.ts']) {
        const r = run(TSX, [`evals/fixtures/figma-readiness/${fixture}`]);
        if (r.status !== 0) throw new Error(`Readiness ${fixture} failed:\n${r.out}`);
      }
    },
  },
  {
    id: 'figma-readiness-routing-and-consolidation',
    claim: 'C2-refusal',
    run: () => {
      for (const fixture of ['routing-refusal-check.ts', 'consolidation-check.ts', 'end-to-end-check.ts']) {
        const r = run(TSX, [`evals/fixtures/figma-readiness/${fixture}`]);
        if (r.status !== 0) throw new Error(`Readiness ${fixture} failed:\n${r.out}`);
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const results: Array<{ id: string; claim: string; pass: boolean; error?: string }> = [];
for (const c of cases) {
  resetScratch();
  try {
    c.run();
    results.push({ id: c.id, claim: c.claim, pass: true });
    console.log(`  ✔ ${c.claim}  ${c.id}`);
  } catch (err) {
    results.push({ id: c.id, claim: c.claim, pass: false, error: String(err) });
    console.log(`  ✖ ${c.claim}  ${c.id}\n      ${String(err)}`);
  }
}
rmSync(SCRATCH, { recursive: true, force: true });

const passed = results.filter((r) => r.pass).length;
writeFileSync(
  path.join(ROOT, 'evals', 'results.json'),
  JSON.stringify(
    { passed, total: results.length, quarantined: legacyCases.length, results },
    null,
    2,
  ) + '\n',
);
console.log(`\n${passed}/${results.length} evals passed — evals/results.json`);
// The quarantine is never silent: these cases exist, are preserved verbatim in
// evals/legacy-cases.ts, and are NOT part of the N/N above.
console.log(
  `${legacyCases.length} legacy cases quarantined (not run) — Piqueray has no slots / multi-root anatomy / dark theme / second brand yet (006-google-reviews-block added nested instances + repeat collections). See evals/REMOVED-CASES.md.`,
);
process.exit(passed === results.length ? 0 : 1);
