/**
 * Produit le dossier des parents dont la porte de dépendance est FERMÉE.
 *
 *   npx tsx extract/figma/organism-audit/tools/build-blocked.mts [subjectId…]
 *
 * Un parent bloqué reçoit un dossier COMPLET — son `DependencyGateResult`
 * entier (chemin du reçu, hash, versions, verdict brut ET verdict mappé,
 * motifs de péremption), ses faits obligatoires marqués `not-proven`, et zéro
 * cas fabriqué.  Le verdict n'est jamais fourni : il est dérivé de la porte.
 *
 * L'outil REFUSE une porte ouverte : un parent dont le prérequis est prouvé
 * doit passer par le chemin d'audit complet, sinon on fabriquerait un blocage
 * là où la preuve pouvait exister.  Refuser ici est fail-closed dans les deux
 * sens, ce qui est exactement le point.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildBlockedParentDossier, renderOrganismReportMd } from '../report.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const SPEC = path.join(REPO, 'specs/013-auditer-fidelite-organismes');
const PROOFS = path.join(SPEC, 'proofs');

const campaign = JSON.parse(readFileSync(path.join(SPEC, 'contracts/audit-campaign.json'), 'utf8')) as any;

const requested = process.argv.slice(2);
const targets = campaign.subjects.filter(
  (s: any) => s.dependencyId && (requested.length === 0 || requested.includes(s.id)),
);
if (targets.length === 0) {
  console.error('aucun sujet à porte de dépendance sélectionné');
  process.exit(2);
}

let failures = 0;

for (const subject of targets) {
  const receiptPath = path.join(PROOFS, 'dependencies', `${subject.id}.json`);
  if (!existsSync(receiptPath)) {
    console.error(`✗ ${subject.id} : reçu de dépendance absent (${path.relative(REPO, receiptPath)}) — lancer --check-dependencies d'abord`);
    failures += 1;
    continue;
  }
  const gateResult = JSON.parse(readFileSync(receiptPath, 'utf8'));

  if (gateResult.open === true) {
    console.error(
      `✗ ${subject.id} : la porte est OUVERTE — ce sujet doit passer par le chemin d'audit complet, pas par le dossier de blocage`,
    );
    failures += 1;
    continue;
  }

  if (!Array.isArray(subject.coverage?.requiredFactIds) || subject.coverage.requiredFactIds.length === 0) {
    console.error(
      `✗ ${subject.id} : aucun fait obligatoire déclaré — un dossier de blocage vide se lit comme « rien à prouver »`,
    );
    failures += 1;
    continue;
  }
  if (Array.isArray(subject.cases) && subject.cases.length > 0) {
    console.error(
      `✗ ${subject.id} : ${subject.cases.length} cas déclaré(s) sous porte fermée — aucun cas parent ne peut être fabriqué`,
    );
    failures += 1;
    continue;
  }

  const { result, issues } = buildBlockedParentDossier({
    target: {
      id: subject.id,
      displayName: subject.displayName,
      wave: subject.wave,
      contractId: subject.contractId,
      contractVersion: subject.contractVersion,
      contractPath: subject.contractPath,
      figmaSetNodeId: subject.figmaSetNodeId,
      dependencyId: subject.dependencyId,
      requiredFactIds: subject.coverage.requiredFactIds,
    },
    gateResult,
  });

  if (issues.length > 0) {
    for (const issue of issues) console.error(`✗ ${subject.id} : ${issue.code} @ ${issue.path} — ${issue.message}`);
    failures += 1;
    continue;
  }

  const markdown = renderOrganismReportMd(result, {
    reference: { fileKey: campaign.reference.fileKey, fileVersion: campaign.reference.fileVersion },
    auditRefs: subject.auditRefs ?? [],
    knownLimits: subject.knownLimits ?? [],
    deferredWork: [],
    remediation: null,
  });

  const dir = path.join(PROOFS, 'organisms', subject.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(path.join(dir, 'REPORT.md'), markdown);

  console.log(
    `✓ ${subject.id.padEnd(11)} → ${result.verdict} · ${result.facts.length} faits obligatoires (tous not-proven) · ` +
      `dépendance ${gateResult.dependencyContractId} : reçu "${gateResult.receiptVerdict}" → mappé "${gateResult.actualVerdict}", porte ${gateResult.open ? 'ouverte' : 'fermée'}`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} sujet(s) en échec — aucun dossier fabriqué pour eux.`);
  process.exit(1);
}
console.log(`\n${targets.length} dossier(s) de blocage écrit(s) sous ${path.relative(REPO, path.join(PROOFS, 'organisms'))}/`);
