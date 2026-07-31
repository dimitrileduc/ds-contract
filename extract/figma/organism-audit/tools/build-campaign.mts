/**
 * Assemble la synthèse de campagne (US4) — T041/T042/T043.
 *
 *   npx tsx extract/figma/organism-audit/tools/build-campaign.mts
 *   npx tsx extract/figma/organism-audit/tools/build-campaign.mts --verify
 *
 * `proofs/result.json` est l'AUTORITÉ ; `proofs/REPORT.md` en est rendu, jamais
 * écrit à la main. Le mode `--verify` recalcule tout depuis le JSON et compare
 * au Markdown : toute divergence rend la campagne `invalid`, code 2.
 *
 * Les horodatages sont informatifs et EXCLUS des hashes déterministes — deux
 * exécutions à entrées identiques produisent les mêmes faits, verdicts et
 * hashes.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { deriveCampaignVerdict, EXPECTED_ORGANISM_COUNT } from '../verdict.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const SPEC = path.join(REPO, 'specs/013-auditer-fidelite-organismes');
const PROOFS = path.join(SPEC, 'proofs');
const VERIFY = process.argv.includes('--verify');

const sha256 = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');
const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

/** Hash déterministe d'un arbre de fichiers — chemins triés, contenu inclus. */
function treeSha(root: string, filter: (name: string) => boolean): string {
  const parts: string[] = [];
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir).sort()) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (filter(entry)) parts.push(`${path.relative(REPO, full)}:${sha256(readFileSync(full))}`);
    }
  };
  walk(root);
  return sha256(parts.join('\n'));
}

const campaign = readJson(path.join(SPEC, 'contracts/audit-campaign.json'));
const campaignBytes = readFileSync(path.join(SPEC, 'contracts/audit-campaign.json'));

// ---- les douze dossiers, dans l'ordre du manifeste -------------------------
const subjects = campaign.subjects.map((declared: any) => {
  const dossier = path.join(PROOFS, 'organisms', declared.id);
  const resultPath = path.join(dossier, 'result.json');
  const reportPath = path.join(dossier, 'REPORT.md');
  if (!existsSync(resultPath)) {
    return { id: declared.id, wave: declared.wave, missing: true } as any;
  }
  const r = readJson(resultPath);
  const by = (o: string) => r.facts.filter((f: any) => f.outcome === o).length;
  return {
    id: r.id,
    displayName: r.displayName,
    wave: r.wave,
    contract: r.contract,
    figmaSetNodeId: r.figmaSetNodeId,
    requiredFacts: r.facts.length,
    proved: by('proved'),
    divergent: by('divergent'),
    limited: by('limited'),
    notProven: by('not-proven'),
    coverageExact:
      Array.isArray(r.coverage?.missing) &&
      Array.isArray(r.coverage?.unexpected) &&
      r.coverage.missing.length === 0 &&
      r.coverage.unexpected.length === 0,
    dependency: r.dependency
      ? {
          dependencyContractId: r.dependency.dependencyContractId,
          resultPath: r.dependency.resultPath ?? null,
          receiptSha256: r.dependency.receiptSha256 ?? null,
          contractVersion: r.dependency.contractVersion ?? null,
          probative: r.dependency.probative,
          receiptVerdict: r.dependency.receiptVerdict,
          actualVerdict: r.dependency.actualVerdict,
          open: r.dependency.open,
        }
      : null,
    pixelsRawPct: r.cases?.[0]?.pixels?.rawPct ?? null,
    verdict: r.verdict,
    reasons: r.reasons ?? [],
    dossier: `organisms/${r.id}/REPORT.md`,
    resultSha256: sha256(readFileSync(resultPath)),
    reportPresent: existsSync(reportPath),
    missing: false,
  };
});

const missing = subjects.filter((s: any) => s.missing).map((s: any) => s.id);

// ---- vagues ---------------------------------------------------------------
const waves = [1, 2, 3].map((n) => {
  const receiptPath = path.join(PROOFS, 'organisms', `wave-${n}-classification.json`);
  const receipt = existsSync(receiptPath) ? readJson(receiptPath) : null;
  const ids = campaign.subjects.filter((s: any) => s.wave === n).map((s: any) => s.id);
  return {
    wave: n,
    startsAfter: campaign.waves?.[n - 1]?.startsAfter ?? (n === 1 ? null : n - 1),
    subjectIds: ids,
    classified: receipt?.classified === true,
    receipt: receipt ? `organisms/wave-${n}-classification.json` : null,
    independenceFromGatedDependencies: receipt?.independenceFromGatedDependencies ?? null,
    positiveVerdictsUnderClosedGate: receipt?.positiveVerdictsUnderClosedGate ?? null,
  };
});

// ---- travaux reportés -----------------------------------------------------
const deferredPath = path.join(PROOFS, 'deferred/work.json');
const deferredWork = existsSync(deferredPath) ? readJson(deferredPath).items ?? [] : [];

// ---- verdict --------------------------------------------------------------
const invalidReasons: string[] = [];
if (missing.length > 0) invalidReasons.push(`dossiers-missing:${missing.join(',')}`);
for (const s of subjects) {
  if (!s.missing && !s.reportPresent) invalidReasons.push(`report-missing:${s.id}`);
  if (!s.missing && !s.coverageExact && s.verdict !== 'blocked') {
    invalidReasons.push(`coverage-inexact:${s.id}`);
  }
}
for (const w of waves) if (!w.classified) invalidReasons.push(`wave-unclassified:${w.wave}`);

const { verdict, exitCode, reasons } = deriveCampaignVerdict({
  subjectVerdicts: subjects.filter((s: any) => !s.missing).map((s: any) => s.verdict),
  dossiersValid: missing.length === 0,
  invalidReasons,
});

const summary = {
  organisms: subjects.length,
  proved: subjects.filter((s: any) => s.verdict === 'proved').length,
  divergent: subjects.filter((s: any) => s.verdict === 'divergent').length,
  limited: subjects.filter((s: any) => s.verdict === 'limited').length,
  notProven: subjects.filter((s: any) => s.verdict === 'not-proven').length,
  blocked: subjects.filter((s: any) => s.verdict === 'blocked').length,
  requiredFacts: subjects.reduce((n: number, s: any) => n + (s.requiredFacts ?? 0), 0),
  factsProved: subjects.reduce((n: number, s: any) => n + (s.proved ?? 0), 0),
  factsDivergent: subjects.reduce((n: number, s: any) => n + (s.divergent ?? 0), 0),
  factsLimited: subjects.reduce((n: number, s: any) => n + (s.limited ?? 0), 0),
  factsNotProven: subjects.reduce((n: number, s: any) => n + (s.notProven ?? 0), 0),
  deferredWork: deferredWork.length,
};

const result = {
  schemaVersion: 1,
  campaignId: campaign.campaignId ?? '013-auditer-fidelite-organismes',
  reference: campaign.reference,
  generatedSurface: {
    kind: campaign.generatedSurface?.kind ?? 'react-storybook',
    sourceRoot: campaign.generatedSurface?.sourceRoot ?? 'src/components',
    generatedTreeSha256: treeSha(path.join(REPO, 'src/components'), (n) => n.endsWith('.tsx') || n.endsWith('.css')),
  },
  inputHashes: {
    campaign: sha256(campaignBytes),
    contracts: treeSha(path.join(REPO, 'contracts'), (n) => n.endsWith('.contract.json')),
    tokens: treeSha(path.join(REPO, 'tokens'), (n) => n.endsWith('.tokens.json')),
    dependencies: treeSha(path.join(PROOFS, 'dependencies'), (n) => n.endsWith('.json')),
  },
  waves,
  subjects,
  deferredWork,
  summary,
  verdict,
  exitCode,
  reasons,
};

// ---------------------------------------------------------------------------
// Le Markdown — RENDU depuis `result`, jamais écrit à la main.
// ---------------------------------------------------------------------------
const cell = (v: unknown): string => String(v ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function renderMarkdown(r: typeof result): string {
  const L: string[] = [];
  const push = (s = '') => L.push(s);

  push('# Campagne 013 — Auditer la fidélité des organismes');
  push();
  push('> Rendu depuis `result.json` — le Markdown n\'est jamais l\'autorité du verdict.');
  push();

  push('## 1. Provenance');
  push();
  push(`- campagne : \`${r.campaignId}\` · hash \`${r.inputHashes.campaign.slice(0, 16)}…\``);
  push(`- Figma : fileKey \`${r.reference.fileKey}\`, version \`${r.reference.fileVersion}\`, **readOnly ${r.reference.readOnly}**`);
  push(`- contrats : \`${r.inputHashes.contracts.slice(0, 16)}…\` · tokens : \`${r.inputHashes.tokens.slice(0, 16)}…\``);
  push(`- surface prouvée : ${r.generatedSurface.kind} sous \`${r.generatedSurface.sourceRoot}\` · arbre \`${r.generatedSurface.generatedTreeSha256.slice(0, 16)}…\``);
  push('- **zéro commande Figma write/push/update** — la seule route vers Figma est un GET (reçu : `baseline/no-write-path.json`)');
  push();

  push('## 2. Index des douze verdicts');
  push();
  push('| vague | organisme | faits | prouvés | divergents | limités | non prouvés | pixels | dépendance | verdict | dossier |');
  push('|---:|---|---:|---:|---:|---:|---:|---:|---|---|---|');
  for (const s of r.subjects) {
    const dep = s.dependency
      ? `${s.dependency.dependencyContractId} (${s.dependency.receiptVerdict}→${s.dependency.actualVerdict}, ${s.dependency.open ? 'ouverte' : 'fermée'})`
      : 'Aucune';
    const px = s.pixelsRawPct === null || s.pixelsRawPct === undefined ? 'N/A — aucun cas' : `${s.pixelsRawPct.toFixed(2)} %`;
    push(
      `| ${s.wave} | ${cell(s.id)} | ${s.requiredFacts} | ${s.proved} | ${s.divergent} | ${s.limited} | ${s.notProven} | ${px} | ${cell(dep)} | **${s.verdict}** | [dossier](${s.dossier}) |`,
    );
  }
  push();

  push('## 3. Exécution des vagues');
  push();
  push('| vague | démarre après | sujets | classifiée | indépendance dépendances gatées | verdicts positifs sous porte fermée |');
  push('|---:|---|---|---|---|---:|');
  for (const w of r.waves) {
    push(
      `| ${w.wave} | ${cell(w.startsAfter ?? 'rien')} | ${w.subjectIds.join(', ')} | ${w.classified ? 'oui' : '**non**'} | ${cell(w.independenceFromGatedDependencies)} | ${cell(w.positiveVerdictsUnderClosedGate)} |`,
    );
  }
  push();

  push('## 4. Synthèse de couverture');
  push();
  push(`- organismes : **${r.summary.organisms}** attendus ${EXPECTED_ORGANISM_COUNT}`);
  push(`- faits obligatoires : **${r.summary.requiredFacts}** — ${r.summary.factsProved} prouvés · ${r.summary.factsDivergent} divergents · ${r.summary.factsLimited} limités · ${r.summary.factsNotProven} non prouvés`);
  push(`- couverture exacte (missing == [] et unexpected == []) : ${r.subjects.filter((s: any) => s.coverageExact).length}/${r.subjects.length}`);
  push();

  push('## 5. Matrice de traçabilité');
  push();
  push('La trace fait par fait vit dans chaque dossier (`organisms/<id>/REPORT.md`, rubrique 5) : une ligne par fait obligatoire avec sa référence Figma, son JSON Pointer contractuel, sa référence générée et son verdict. Elle n\'est pas recopiée ici — la recopier créerait une seconde autorité.');
  push();

  push('## 6. Verdicts par organisme');
  push();
  for (const s of r.subjects) {
    push(`- **${s.id}** (${s.contract?.id}@${s.contract?.version}, node \`${s.figmaSetNodeId}\`) → \`${s.verdict}\` — ${s.reasons.length ? s.reasons.join(' · ') : 'Aucune raison enregistrée'}`);
  }
  push();

  push('## 7. Divergences et limites nommées');
  push();
  const nonPositive = r.subjects.filter((s: any) => s.verdict !== 'proved');
  if (nonPositive.length === 0) push('Aucun');
  else {
    for (const s of nonPositive) {
      push(`- **${s.id}** — ${s.divergent} divergent(s), ${s.limited} limité(s), ${s.notProven} non prouvé(s). Détail et cause racine : \`${s.dossier}\`.`);
    }
  }
  push();

  push('## 8. Travaux reportés (valeurs en dur / tokens)');
  push();
  if (r.deferredWork.length === 0) push('Aucun');
  else {
    push('| id | organisme | fait | catégorie | contrat porteur | pointeur | cause observée | impact verdict | statut |');
    push('|---|---|---|---|---|---|---|---|---|');
    for (const d of r.deferredWork) {
      push(
        `| ${cell(d.id)} | ${cell(d.subjectId)} | ${cell(d.factId)} | ${cell(d.category)} | ${cell(d.contractId)} | \`${cell(d.contractPointer)}\` | ${cell(d.observedCause)} | ${cell(d.verdictImpact)} | ${cell(d.status)} |`,
      );
    }
  }
  push();

  push('## 9. Portes dépôt et campagne');
  push();
  push('Les portes techniques du dépôt sont consignées dans `closure/gates.json`. La campagne elle-même sort **' + r.exitCode + '** (`' + r.verdict + '`).');
  push();
  if (r.verdict === 'complete-with-blocks') {
    push('> **Un code 1 est une campagne honnêtement terminée, PAS une déclaration de fidélité globale.** Les organismes non positifs sont réels et leurs causes sont nommées ci-dessus.');
    push();
  }

  push('## 10. Reçu de revue');
  push();
  push('`closure/review.json` — douze IDs dans l\'ordre des vagues, au moins un chemin concret ouvert par organisme, verdicts égaux à `result.json`.');
  push();

  return L.join('\n');
}

const markdown = renderMarkdown(result);
const resultPath = path.join(PROOFS, 'result.json');
const reportPath = path.join(PROOFS, 'REPORT.md');

if (VERIFY) {
  const problems: string[] = [];
  if (!existsSync(resultPath)) problems.push('result.json absent');
  if (!existsSync(reportPath)) problems.push('REPORT.md absent');
  if (problems.length === 0) {
    const onDisk = readFileSync(resultPath, 'utf8');
    const fresh = `${JSON.stringify(result, null, 2)}\n`;
    if (onDisk !== fresh) problems.push('result.json ne correspond plus aux dossiers — réassembler');
    if (readFileSync(reportPath, 'utf8') !== markdown) {
      problems.push('REPORT.md diverge de ce que result.json rend — le Markdown n\'est jamais l\'autorité');
    }
  }
  if (problems.length > 0) {
    for (const p of problems) console.error(`✗ ${p}`);
    console.error('\ncampagne INVALID — exit 2');
    process.exit(2);
  }
  console.log('✔ result.json ↔ REPORT.md cohérents');
  process.exit(0);
}

mkdirSync(PROOFS, { recursive: true });
writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(reportPath, markdown);

console.log(`campagne : ${verdict} (exit ${exitCode})`);
console.log(`  ${summary.organisms} organismes — ${summary.proved} prouvés · ${summary.divergent} divergents · ${summary.blocked} bloqués`);
console.log(`  ${summary.requiredFacts} faits — ${summary.factsProved} prouvés · ${summary.factsDivergent} divergents · ${summary.factsLimited} limités · ${summary.factsNotProven} non prouvés`);
if (reasons.length > 0) console.log(`  raisons : ${reasons.join(', ')}`);
console.log(`\n→ ${path.relative(REPO, resultPath)}\n→ ${path.relative(REPO, reportPath)}`);
process.exit(0);
