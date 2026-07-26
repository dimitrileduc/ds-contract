#!/usr/bin/env node
// note-census.mjs — le COMPTEUR de notes du relevé (FR-028 / SC-001 / SC-002 / SC-011).
//
// Pourquoi il existe : rien dans le dépôt ne compte les notes. `figmaProposalsReport`
// (core/propose-figma.ts l. 4669-4685) concatène `proposal.notes` en puces markdown sous
// des titres `## <setName>` — ni classe, ni compte. Les « 704 notes / 196 classes » du
// 2026-07-26 viennent d'un traitement hors dépôt, donc irreproductible : exactement ce que
// SC-011 interdit.
//
// Il vit sous specs/ et non dans le dépôt applicatif parce que FR-025 gèle ce dernier.
// `specs/` est hors du `include` de tsconfig.json — ce fichier ne touche donc aucun gate
// de types.
//
// Il n'invente rien : il appelle le moteur PUR du dépôt (proposeFromDump) avec exactement
// les mêmes options que la CLI `extract/figma/propose.ts` (l. 213-233), puis classe les
// notes par PRÉFIXE STABLE. On ne regexe jamais le markdown : c'est une sortie de
// présentation, son format n'est pas un contrat.
//
// Usage (tsx est requis : le module importe core/*.ts via des spécificateurs .js) :
//   npx tsx specs/007-figma-extractable-source/tools/note-census.mjs <dump.json> [--json <out>]
//
// Sortie : un résumé lisible sur stdout + optionnellement releves/notes-<date>.json.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isDumpSet } from '../../../extract/figma/types.js';
import { loadTokenCorpus } from '../../../extract/figma/tokens.js';
import { loadContracts } from '../../../extract/figma/propose.js';
import { dumpCapturesHidden, proposeFromDump } from '../../../core/propose-figma.js';

// ⚠ MIROIR de extract/figma/propose.ts l. 188-194 (loadIconRegistry n'y est pas exportée).
// Une absence de registre propose exactement comme avant, jamais un échec dur.
const loadIconRegistry = (root) => {
  try {
    return JSON.parse(readFileSync(path.join(root, 'contracts', 'icons.registry.json'), 'utf8'));
  } catch {
    return undefined;
  }
};

/** Les six classes de notes, reconnues par préfixe/motif stable.
 *  Chaînes citées de core/propose-figma.ts — cf. contracts/note-census.md §4. */
const CLASSES = [
  { key: 'A', label: 'nom de set != nom de composant PascalCase', test: (n) => n.startsWith('contract name: drawn set name ') },
  { key: 'B', label: "nom de set a caracteres qu'un id ne porte pas", test: (n) => n.startsWith('contract id: drawn set name ') },
  { key: 'C', label: 'propriete hors identifiant legal', test: (n) => n.includes('contains characters outside a legal identifier') },
  { key: 'D', label: 'collision de nom de part dans un contrat', test: (n) => n.includes('already names another part of this contract') },
  { key: 'E', label: 'valeur sans token (UNBOUND)', test: (n) => n.startsWith('UNBOUND ') },
  { key: 'F', label: 'style de texte non derive d\'un token', test: (n) => n.includes('is not a token-derived style') },
  // 7e classe, trouvée dans proposeBatchFromDump : deux sets dont les noms se réduisent au
  // même id. Elle DEVIENT un risque réel dès que la table de nommage renomme 36 masters.
  { key: 'G', label: 'deux sets revendiquent le meme contract id', test: (n) => n.includes('is claimed by two sets in this dump') },
];

const classify = (note) => CLASSES.find((c) => c.test(note))?.key ?? 'Z';

/** Le canal d'une note UNBOUND : `UNBOUND <nodePath> <property> = <valeur> — …`
 *
 *  ⚠ Corrigé le 2026-07-26 (T030) : la version d'origine (`\S+\s+\S+\s*=`) suppose que
 *  <nodePath> ne porte jamais d'espace. C'est faux dès qu'un calque est nommé d'après son
 *  contenu rédactionnel (exactement le défaut FR-005 que cette spec corrige par ailleurs) —
 *  ex. `Coordonnees:root/wrapper/Contact/Tél : +32 (0)87 46 32 66  Email: info@piqueray.be`.
 *  Le motif d'origine matchait alors le mauvais mot et retombait sur `(inconnu)` (69 notes
 *  perdues sur le relevé d'ouverture, vérifié). Le canal est en réalité toujours le DERNIER
 *  identifiant alphabétique avant ` = ` : `.*` glouton + backtrack retrouve ce point sans
 *  supposer l'absence d'espace dans le chemin. Le total de la classe E (`counts.E`, basé sur
 *  `note.startsWith('UNBOUND ')`) est inchangé par ce correctif — seule la RÉPARTITION par
 *  canal, jusqu'ici partiellement illisible, devient exacte. Confirmé par recoupement
 *  indépendant : les totaux corrigés (58 itemSpacing, 22 padding, 48 fontWeight,
 *  46 lineHeight, 9 strokeWeight, 3 cornerRadius, 5 fontSize, 1 opacity, 1 minHeight = 193)
 *  égalent exactement ceux dérivés en Phase 0 (research.md R4/R8) et déjà repris dans
 *  tasks.md (T036-T044) — trois dérivations indépendantes convergent. */
const unboundChannel = (note) => {
  const m = /^UNBOUND\s+.*\s([A-Za-z]+)\s=\s/.exec(note);
  return m ? m[1] : '(inconnu)';
};
const unboundHasNoNearToken = (note) => note.includes('(none found)');

function main() {
  const args = process.argv.slice(2);
  const jsonIdx = args.indexOf('--json');
  const jsonOut = jsonIdx >= 0 ? args.splice(jsonIdx, 2)[1] : undefined;
  const dumpPath = args[0];
  if (!dumpPath) {
    console.error('usage: npx tsx note-census.mjs <dump.json> [--json <out.json>]');
    process.exit(2);
  }

  // La racine du dépôt : trois niveaux au-dessus de specs/007-…/tools/.
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
  const dump = JSON.parse(readFileSync(path.resolve(dumpPath), 'utf8'));

  // Mêmes options que la CLI (extract/figma/propose.ts l. 213-233) — sinon le compteur
  // mesurerait autre chose que ce que la chaîne officielle produit.
  const corpus = loadTokenCorpus(root);
  const loaded = loadContracts(path.join(root, 'contracts'));
  const opts = {
    corpus,
    contractIdByName: loaded.byName,
    contractsById: loaded.byId,
    contractIdByKey: loaded.byKey,
    fileKey: dump._provenance?.fileKey ?? null,
    hiddenCaptured: dumpCapturesHidden(dump._provenance),
    iconRegistry: loadIconRegistry(root),
  };

  const perSet = [];
  const claimedIds = new Map();
  const extraNotes = [];
  let valid = 0;

  for (const [name, value] of Object.entries(dump)) {
    if (name === '_provenance' || !isDumpSet(value)) continue;
    try {
      // proposeFromDump valide contre ContractSchema en interne (parse, pas safeParse) :
      // un retour sans exception EST la preuve de validité schéma de ce set.
      const p = proposeFromDump(value, opts);
      valid++;
      const id = p.contract?.id;
      if (typeof id === 'string') {
        const holder = claimedIds.get(id);
        if (holder !== undefined) extraNotes.push(`contract id "${id}" is claimed by two sets in this dump ("${holder}" and "${name}")`);
        else claimedIds.set(id, name);
      }
      perSet.push({ setName: name, id: id ?? null, valid: true, notes: p.notes, unbound: p.unbound?.length ?? 0 });
    } catch (e) {
      perSet.push({ setName: name, id: null, valid: false, error: String(e?.message ?? e), notes: [], unbound: 0 });
    }
  }

  const allNotes = [...perSet.flatMap((s) => s.notes), ...extraNotes];
  const counts = Object.fromEntries(CLASSES.map((c) => [c.key, 0]));
  counts.Z = 0;
  const unclassified = [];
  for (const n of allNotes) {
    const k = classify(n);
    counts[k]++;
    if (k === 'Z') unclassified.push(n);
  }

  const unbound = allNotes.filter((n) => n.startsWith('UNBOUND '));
  const byChannel = {};
  for (const n of unbound) {
    const ch = unboundChannel(n);
    byChannel[ch] ??= { total: 0, sansTokenProche: 0 };
    byChannel[ch].total++;
    if (unboundHasNoNearToken(n)) byChannel[ch].sansTokenProche++;
  }

  const report = {
    date: new Date().toISOString().slice(0, 10),
    dump: path.resolve(dumpPath),
    masters: perSet.length,
    schemaValid: `${valid}/${perSet.length}`,
    totalNotes: allNotes.length,
    counts,
    unboundByChannel: byChannel,
    unboundSansTokenProche: unbound.filter(unboundHasNoNearToken).length,
    perSet,
    unclassified,
  };

  console.log(`\nRELEVÉ — ${report.date}`);
  console.log(`  masters            ${report.masters}`);
  console.log(`  valides (schéma)   ${report.schemaValid}`);
  console.log(`  notes (total)      ${report.totalNotes}\n`);
  for (const c of CLASSES) console.log(`  ${c.key}  ${String(counts[c.key]).padStart(4)}  ${c.label}`);
  if (counts.Z) console.log(`  Z  ${String(counts.Z).padStart(4)}  NON CLASSÉES — à examiner, jamais à ignorer`);
  console.log('\n  Classe E par canal :');
  for (const [ch, v] of Object.entries(byChannel).sort((a, b) => b[1].total - a[1].total)) {
    console.log(`    ${ch.padEnd(18)} ${String(v.total).padStart(4)}   dont sans token de valeur identique : ${v.sansTokenProche}`);
  }
  console.log(`\n  ⚠ Classe F : gouvernée par la regex /^font\\.(.+?)\\.size/ de core/token-corpus.ts`);
  console.log(`    face à la convention typography.<rôle>.size — AUCUNE action canvas ne la déplace.`);
  console.log(`    Elle est comptée à part, nommée, et léguée (trou d'émetteur n° 1). Cf. research.md R9.\n`);

  if (jsonOut) {
    writeFileSync(path.resolve(jsonOut), JSON.stringify(report, null, 2) + '\n');
    console.log(`  → ${jsonOut}\n`);
  }
}

main();
