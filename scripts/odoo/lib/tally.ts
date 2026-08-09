/**
 * Le décompte d'une porte hors ligne — trois états, jamais agrégés en deux.
 *
 * ── Pourquoi une classe partagée plutôt que trois `let` par fichier ─────────
 * `check-module.ts` et `visual/selftest.mts` portaient chacun les mêmes trois
 * compteurs, les mêmes trois glyphes, la même ligne de résumé et la même règle
 * de sortie — au caractère près, y compris la phrase « Un contrôle sauté n'est
 * PAS un contrôle réussi ». Cette phrase n'est pas de l'ornement : c'est la
 * politique du dépôt (un saut ne se compte jamais comme un succès, et `--strict`
 * le promeut en échec). Une politique tenue en deux copies est une politique
 * qu'on peut corriger d'un seul côté sans que rien ne le dise.
 *
 * Les trois helpers sont des propriétés-flèches pour que l'appelant puisse
 * écrire `const { ok, ko, saute } = new Tally()` et garder ses sites d'appel
 * inchangés.
 */
export class Tally {
  passed = 0;
  failed = 0;
  skipped = 0;

  /** Un contrôle TENU. Le détail est facultatif ; il dit ce qui a été observé. */
  ok = (nom: string, detail = ''): void => {
    this.passed++;
    console.log(`  ✔ ${nom}${detail ? ` — ${detail}` : ''}`);
  };

  /** Un contrôle ÉCHOUÉ. `pourquoi` nomme l'écart, pas seulement le symptôme. */
  ko = (nom: string, pourquoi: string): void => {
    this.failed++;
    console.log(`  ✖ ${nom}\n      ${pourquoi}`);
  };

  /** Un contrôle qu'on n'a PAS pu faire ici et maintenant. Jamais un succès. */
  saute = (nom: string, pourquoi: string): void => {
    this.skipped++;
    console.log(`  ⊘ ${nom}\n      SAUTÉ — ${pourquoi}`);
  };

  /**
   * Imprime le résumé et rend le CODE DE SORTIE (0 ou 1) sans jamais appeler
   * `process.exit` lui-même : c'est à la porte de décider quand elle sort.
   */
  resume(strict: boolean): number {
    console.log(`\n${this.passed} passé(s), ${this.skipped} sauté(s), ${this.failed} échoué(s).`);
    if (this.skipped > 0 && !strict) {
      console.log('Un contrôle sauté n\'est PAS un contrôle réussi. `--strict` le compte comme échec.');
    }
    return this.failed > 0 || (strict && this.skipped > 0) ? 1 : 0;
  }
}
