/**
 * Les reçus de qualification. Spec 019, tâche T016.
 *
 * Un reçu est la SEULE preuve d'un scénario live : ni la mémoire de l'agent, ni
 * une capture d'écran isolée, ni « ça a marché quand je l'ai essayé ». Sa forme
 * est celle du `$defs/receipt` de `qualification-manifest.schema.json`.
 *
 * ── Deux règles qui ne se négocient pas ─────────────────────────────────────
 * 1. `skipped` n'est JAMAIS agrégé comme `pass`. `resume()` compte les trois
 *    états séparément et le code de sortie ne devient vert que sans échec.
 * 2. Un reçu porte des OBSERVATIONS, pas des conclusions. « le bouton reste
 *    verrouillé » est une observation ; « la gouvernance tient » est un claim,
 *    et un claim se fait ailleurs, après lecture.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, repoRelative, sha256 } from '../../../../scripts/odoo/lib/canonical.js';

export const REPO = REPO_ROOT;
export const PROOFS = path.join(REPO, 'specs', '019-odoo-production-foundation', 'proofs');

export type Statut = 'pass' | 'fail' | 'skipped';

export interface Artefact {
  path: string;
  sha256: string;
  kind?: 'json' | 'image' | 'log' | 'html' | 'video' | 'report';
}

export interface Receipt {
  receiptId: string;
  scenarioId: string;
  snapshotId: string;
  status: Statut;
  fixture: string;
  observations: string[];
  artifacts: Artefact[];
  limitCodes: string[];
  durationMs?: number;
}

export { sha256 };

/** Un constat élémentaire du scénario : ce qui a été TENTÉ et ce qui s'est passé. */
export interface Constat {
  readonly quoi: string;
  readonly attendu: string;
  readonly observe: string;
  readonly statut: Statut;
}

export class Recueil {
  private readonly constats: Constat[] = [];
  private readonly artefacts: Artefact[] = [];
  private readonly limites = new Set<string>();

  constructor(
    readonly scenarioId: string,
    readonly snapshotId: string,
    readonly fixture: string,
  ) {}

  /** Un constat dont le verdict est l'ÉGALITÉ des deux chaînes.
   *  Réservé aux cas où `observe` est construit pour être comparable mot pour
   *  mot. Dès que l'observation porte un détail (« oui (3 nœuds) »), employer
   *  `constateSi` : comparer une chaîne enrichie à une chaîne nue produit un
   *  faux rouge, ce qui est arrivé deux fois le 2026-08-08. */
  constate(quoi: string, attendu: string, observe: string): void {
    this.constateSi(quoi, attendu === observe, attendu, observe);
  }

  /** Un constat dont le verdict est calculé par l'appelant. `observe` peut alors
   *  porter autant de détail qu'il faut sans influencer le résultat. */
  constateSi(quoi: string, ok: boolean, attendu: string, observe: string): void {
    const statut: Statut = ok ? 'pass' : 'fail';
    this.constats.push({ quoi, attendu, observe, statut });
    console.log(`  ${statut === 'pass' ? '✔' : '✖'} ${quoi}\n      attendu « ${attendu} » · observé « ${observe} »`);
  }

  /** Un constat qu'on n'a PAS pu faire. Il ne compte jamais comme réussi. */
  saute(quoi: string, pourquoi: string, limitCode?: string): void {
    this.constats.push({ quoi, attendu: '(non exécuté)', observe: pourquoi, statut: 'skipped' });
    if (limitCode) this.limites.add(limitCode);
    console.log(`  ⊘ ${quoi}\n      SAUTÉ — ${pourquoi}${limitCode ? ` [${limitCode}]` : ''}`);
  }

  limite(code: string): void {
    this.limites.add(code);
  }

  artefact(absPath: string, bytes: Buffer, kind: Artefact['kind'] = 'json'): void {
    mkdirSync(path.dirname(absPath), { recursive: true });
    writeFileSync(absPath, bytes);
    // `repoRelative` REFUSE un chemin hors dépôt au lieu de rendre un `../..` :
    // un artefact écrit ailleurs rendrait le reçu dépendant de la machine.
    this.artefacts.push({ path: repoRelative(absPath), sha256: sha256(bytes), kind });
  }

  get resume() {
    const par = (s: Statut) => this.constats.filter((c) => c.statut === s).length;
    return { pass: par('pass'), fail: par('fail'), skipped: par('skipped'), total: this.constats.length };
  }

  /** Le statut du reçu. Un seul échec suffit ; un saut ne suffit jamais à
   *  réussir, mais il ne transforme pas non plus le reçu en échec — il le rend
   *  `skipped`, ce que le manifeste refuse de compter comme un succès. */
  get statut(): Statut {
    const r = this.resume;
    if (r.fail > 0) return 'fail';
    if (r.pass === 0 || r.skipped > 0) return 'skipped';
    return 'pass';
  }

  ecrire(nomFichier: string, durationMs?: number): Receipt {
    const recu: Receipt = {
      receiptId: `${this.scenarioId}-${this.snapshotId}`,
      scenarioId: this.scenarioId,
      snapshotId: this.snapshotId,
      status: this.statut,
      fixture: this.fixture,
      observations: this.constats.map(
        (c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`,
      ),
      artifacts: this.artefacts,
      limitCodes: [...this.limites].sort(),
      ...(durationMs !== undefined ? { durationMs } : {}),
    };
    // `observations` exige au moins un élément : un reçu sans observation ne
    // prouve rien et ne doit pas pouvoir exister.
    if (recu.observations.length === 0) {
      recu.observations = ['aucun constat produit — le scénario n\'a rien exercé'];
      recu.status = 'skipped';
    }
    const dest = path.join(PROOFS, nomFichier);
    mkdirSync(PROOFS, { recursive: true });
    writeFileSync(dest, JSON.stringify(recu, null, 2) + '\n');
    const r = this.resume;
    console.log(`\n→ ${path.relative(REPO, dest)}`);
    console.log(`   ${r.pass} constat(s) tenu(s), ${r.skipped} sauté(s), ${r.fail} en échec — reçu « ${recu.status} »`);
    return recu;
  }
}
