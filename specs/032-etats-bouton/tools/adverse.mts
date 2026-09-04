/**
 * T044 — contrôle ADVERSE de `focus-not-pressed-browser-probe`.
 *
 * Une évaluation qui reste verte quand on la sabote ne prouve rien. Ce script
 * casse le contrat d'une ligne à la fois, dans l'espace de travail COPIÉ de
 * l'évaluation (`evals/.scratch`), et exige que la sonde rougisse — puis
 * restaure et exige qu'elle reverdisse.
 *
 * Il réutilise la machinerie de l'évaluation elle-même — `resetScratch`, `run`,
 * `editJson`, `buildTokens`, `generate`, `CONTRACT` d'`evals/harness.ts` — ET
 * **la source même de la sonde** (`evals/probes/focus-not-pressed.ts`, importée
 * par le cas d'éval aussi). Ce n'est pas une imitation : le sabotage est exercé
 * sur exactement ce que la porte exécute, et il ne peut plus en diverger.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  CONTRACT,
  SCRATCH,
  TSX,
  buildTokens,
  editJson,
  generate,
  resetScratch,
  run,
} from '../../../evals/harness.js';
import {
  FOCUS_NOT_PRESSED_MARKER,
  FOCUS_NOT_PRESSED_PROBE,
} from '../../../evals/probes/focus-not-pressed.js';


/** Rejoue la sonde telle que le cas la lance — même source, même marqueur. */
function probe(): { green: boolean; out: string } {
  const r = run(TSX, ['-e', FOCUS_NOT_PRESSED_PROBE]);
  return { green: r.status === 0 && r.out.includes(FOCUS_NOT_PRESSED_MARKER), out: r.out };
}

/** Régénère le CSS livré depuis le contrat de l'espace copié, par les helpers
 *  du harnais — la façon de régénérer est décidée à UN endroit du dépôt, et
 *  cet outil suit ce que les ~250 cas d'éval suivent.
 *
 *  Les deux échecs sont refusés PAR NOM : une régénération muette laisserait la
 *  sonde échouer plus loin sur un CSS périmé, en désignant la mauvaise cause. */
function regenerate(): void {
  const t = buildTokens();
  if (t.status !== 0) throw new Error(`build-tokens en echec :\n${t.out.slice(0, 800)}`);
  const c = generate();
  if (c.status !== 0) throw new Error(`generate-components en echec :\n${c.out.slice(0, 800)}`);
}

const lines: string[] = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say('# T044 — contrôle adverse de `focus-not-pressed-browser-probe`');
say('');
say('Un cas qui reste vert quand on le sabote ne prouve rien. On casse une ligne');
say("à la fois, dans l'espace de travail copié de l'évaluation, et on exige le rouge.");
say('');

// --- Témoin : vert avant tout sabotage -------------------------------------
// UN SEUL resetScratch : il recopie ~614 Mo. Les sabotages ne touchent qu'un
// fichier, donc on garde ses octets d'origine et on les réécrit entre deux
// essais — c'est le motif que les cas d'éval emploient déjà (`pristine`).
resetScratch();
const pristine = readFileSync(path.join(SCRATCH, CONTRACT), 'utf8');
const restaurerContrat = () => writeFileSync(path.join(SCRATCH, CONTRACT), pristine);
regenerate();
let r = probe();
say('## 0. Témoin — avant tout sabotage');
say(`  ${r.green ? 'VERT' : 'ROUGE'} — ${r.green ? FOCUS_NOT_PRESSED_MARKER : r.out.trim().split('\n').slice(-3).join(' | ').slice(0, 200)}`);
if (!r.green) { say(''); say('ARRÊT : le témoin est déjà rouge, le sabotage ne prouverait rien.'); process.exit(1); }
say('');

// --- Sabotage 1 : retirer focus-visible de contract.states ------------------
say('## 1. Sabotage — retirer `"focus-visible"` de `contract.states`');
editJson(CONTRACT, (d: any) => {
  d.states = d.states.filter((s: string) => s !== 'focus-visible');
  delete d.anatomy.root.states['focus-visible'];
});
regenerate();
r = probe();
const s1 = !r.green;
say(`  attendu ROUGE — obtenu ${r.green ? 'VERT' : 'ROUGE'}`);
say(`  message : ${r.out.split('\n').filter((l) => l.includes('Error')).slice(0, 1).join('').trim().slice(0, 160) || '(aucun)'}`);
say(`  ${s1 ? '✔ le cas refuse par NOM' : '✖ le cas est resté vert — il ne prouve rien'}`);
say('');

// --- Sabotage 2 : le focus porte le fond de SURVOL --------------------------
say('## 2. Sabotage — faire porter au `:focus-visible` le fond de survol');
restaurerContrat();
editJson(CONTRACT, (d: any) => {
  d.anatomy.root.states['focus-visible']['background-color'] =
    '{color.etat.{variant}.fond-survol}';
});
regenerate();
r = probe();
const s2 = !r.green;
say(`  attendu ROUGE — obtenu ${r.green ? 'VERT' : 'ROUGE'}`);
say(`  message : ${r.out.split('\n').filter((l) => l.includes('Error')).slice(0, 1).join('').trim().slice(0, 160) || '(aucun)'}`);
say(`  ${s2 ? '✔ le cas attrape le fond de survol sous l anneau' : '✖ le cas est resté vert — il ne prouve rien'}`);
say('');

// --- Restauration : vert à nouveau ------------------------------------------
say('## 3. Restauration — le contrat sain revient');
restaurerContrat();
regenerate();
r = probe();
say(`  attendu VERT — obtenu ${r.green ? 'VERT' : 'ROUGE'}`);
say('');
const ok = s1 && s2 && r.green;
say('## VERDICT');
say(ok
  ? '  Les deux sabotages rougissent, la restauration reverdit. Le cas prouve\n  quelque chose : il tient FR-004 et FR-006 dans un vrai navigateur.'
  : '  ÉCHEC — au moins une étape du contrôle adverse ne se comporte pas comme exigé.');

const out = path.resolve(process.argv[process.argv.indexOf('--out') + 1] ?? 'adverse.txt');
writeFileSync(out, `${lines.join('\n')}\n`);
console.log(`\n→ ${out}`);
process.exit(ok ? 0 : 1);
