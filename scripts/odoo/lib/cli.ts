/**
 * Le préambule commun des CLI de 019 — un seul endroit.
 *
 * ── Pourquoi ce fichier existe, et ce n'est pas de l'esthétique ─────────────
 * Les quatre portes de `scripts/odoo/` se gardaient chacune ainsi :
 *
 *     if (process.argv[1] && path.resolve(process.argv[1])
 *           .endsWith(path.join('scripts', 'odoo', 'check-inputs.ts'))) { … }
 *
 * C'est une comparaison de SUFFIXE contre un chemin écrit à la main. Renommer
 * ou déplacer le fichier n'aurait pas cassé la compilation : la porte serait
 * simplement devenue un module qui sort 0 sans jamais exécuter `main()`.
 * `npm run odoo:inputs:check` aurait viré au vert **en n'ayant rien vérifié** —
 * exactement la classe de faux succès que ces portes existent pour empêcher.
 *
 * `runAsCli` compare l'IDENTITÉ du module au point d'entrée, ce qui ne dépend
 * d'aucun nom écrit deux fois. C'est la forme qu'employaient déjà les
 * instruments de `integrations/odoo/qa/`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Lit `--drapeau <valeur>` dans un argv. `null` si absent. */
export const arg = (argv: readonly string[], flag: string): string | null => {
  const i = argv.indexOf(flag);
  return i >= 0 ? (argv[i + 1] ?? null) : null;
};

/**
 * N'exécute `main` que si CE module est le point d'entrée. Un import reste
 * silencieux — ce dont dépendent les tests qui importent ces portes comme
 * bibliothèques.
 *
 * Un refus se lit par son MESSAGE : une trace de pile ferait passer une
 * décision volontaire (« lock absent ») pour un plantage.
 */
export function runAsCli(moduleUrl: string, main: () => void | Promise<void>): void {
  if (!process.argv[1] || fileURLToPath(moduleUrl) !== path.resolve(process.argv[1])) return;
  void (async () => {
    try {
      await main();
    } catch (e) {
      console.error(`✖ ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    }
  })();
}
