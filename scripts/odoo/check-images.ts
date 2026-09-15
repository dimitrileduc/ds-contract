/**
 * `check-images.ts` — la porte des photos de page. TinySpec
 * `specs/tiny/images-optimisation.md`.
 *
 * ── Pourquoi cette porte existe ─────────────────────────────────────────────
 * `integrations/odoo/authoring/assets/` n'était surveillé par RIEN. Vérifié
 * plutôt que supposé : le dossier n'apparaît ni dans `evals/golden.json`, ni
 * dans un cliché de parité, ni dans aucun `*:check`. On pouvait convertir,
 * renommer ou supprimer les 131 fichiers sans qu'un seul contrôle bronche. Le
 * seul filet était le `FileNotFoundError` de `compose_page.py::img_url`, qui ne
 * se déclenche qu'en composant contre une instance Odoo vivante — donc bien
 * après le commit.
 *
 * ── Ce qu'elle NE fait pas, et c'est délibéré ───────────────────────────────
 * Elle **n'encode rien**. Elle relit les octets committés et les mesure contre
 * le manifeste. Un contrôle qui régénère hériterait du non-déterminisme de son
 * encodeur entre versions et entre plateformes ; un contrôle qui mesure est
 * déterministe par construction. La conversion, elle, est un outil d'auteur :
 * `scripts/odoo/optimize-images.ts`, hors build.
 *
 * ── Les six refus ───────────────────────────────────────────────────────────
 *   1. format réel ≠ WebP — lu dans les OCTETS, jamais dans l'extension (cinq
 *      `.png` du jeu d'origine contenaient du JPEG et étaient publiés en
 *      `image/png`) ;
 *   2. largeur > largeur cible de la famille ;
 *   3. sha256 ≠ manifeste ;
 *   4. fichier absent du manifeste, ou inversement ;
 *   5. image référencée par un descripteur mais absente du dossier ;
 *   6. fichier non-WebP présent dans le dossier — `IMG_EXTENSIONS` du composeur
 *      prend LE PREMIER TROUVÉ dans l'ordre `.jpg .jpeg .png .webp`, donc un
 *      JPEG déposé à côté d'un WebP gagne EN SILENCE.
 *
 * Une image orpheline (présente, jamais référencée) est un AVERTISSEMENT et non
 * un refus : les bancs `*-test.json` en tirent légitimement, et le tri fin
 * relève de l'auteur, pas d'une porte.
 *
 * Usage : npm run odoo:images:check
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { repoPath, sha256, sortedBy } from './lib/canonical.js';
import { runAsCli } from './lib/cli.js';
import { IMG_DIR, MANIFEST, familleDe, formatReel, dimensions, largeurCible } from './optimize-images.js';

const PAGES_DIR = repoPath('integrations', 'odoo', 'authoring', 'pages');
const COMMUN_DIR = repoPath('integrations', 'odoo', 'authoring', 'commun');

interface EntreeManifeste {
  readonly fichier: string;
  readonly famille: string;
  readonly largeur: number;
  readonly hauteur: number;
  readonly octets: number;
  readonly largeurCible: number;
  readonly sha256: string;
}

/**
 * Les stems d'image cités par les descripteurs.
 *
 * Deux formes, et seulement deux — relevées dans les fichiers, pas supposées :
 *   · `images: { "<part>": "<stem>" }` sur une section ;
 *   · `image: "<stem>"` sur une carte, une tuile ou un avis.
 * On descend récursivement : le contenu commun est repris tel quel par
 * `resolve-page.ts`, et une surcharge peut redéfinir les deux formes.
 */
export function stemsReferences(): Map<string, string[]> {
  const vus = new Map<string, string[]>();
  const noter = (stem: unknown, source: string): void => {
    if (typeof stem !== 'string' || stem === '') return;
    vus.set(stem, [...(vus.get(stem) ?? []), source]);
  };
  const descendre = (noeud: unknown, source: string): void => {
    if (Array.isArray(noeud)) {
      for (const n of noeud) descendre(n, source);
      return;
    }
    if (noeud === null || typeof noeud !== 'object') return;
    for (const [cle, valeur] of Object.entries(noeud as Record<string, unknown>)) {
      if (cle === 'images' && valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur)) {
        for (const v of Object.values(valeur as Record<string, unknown>)) noter(v, source);
        continue;
      }
      if (cle === 'image') {
        noter(valeur, source);
        continue;
      }
      descendre(valeur, source);
    }
  };

  for (const dir of [PAGES_DIR, COMMUN_DIR]) {
    if (!existsSync(dir)) continue;
    for (const f of sortedBy(readdirSync(dir).filter((f) => f.endsWith('.json')), (f) => f)) {
      descendre(JSON.parse(readFileSync(path.join(dir, f), 'utf8')), path.basename(f, '.json'));
    }
  }
  return vus;
}

export function main(): void {
  const refus: string[] = [];
  const avertissements: string[] = [];

  if (!existsSync(MANIFEST)) {
    throw new Error(
      `Manifeste absent : ${path.relative(process.cwd(), MANIFEST)}\n` +
        `  Régénère-le avec : npx tsx scripts/odoo/optimize-images.ts --write`,
    );
  }
  const manifeste = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { images: EntreeManifeste[] };
  const parFichier = new Map(manifeste.images.map((e) => [e.fichier, e]));

  const surDisque = sortedBy(
    readdirSync(IMG_DIR).filter((f) => f !== path.basename(MANIFEST)),
    (f) => f,
  );

  // (6) Un fichier non-WebP masquerait un WebP de même nom, sans un mot.
  for (const f of surDisque) {
    if (path.extname(f).toLowerCase() !== '.webp') {
      refus.push(
        `${f} : fichier non-WebP dans le dossier. IMG_EXTENSIONS du composeur prend le premier trouvé ` +
          `(.jpg .jpeg .png .webp) — celui-ci masquerait « ${path.basename(f, path.extname(f))}.webp » en silence.`,
      );
    }
  }

  for (const f of surDisque) {
    const abs = path.join(IMG_DIR, f);
    const stem = path.basename(f, path.extname(f));
    const attendu = parFichier.get(f);

    if (!attendu) {
      refus.push(`${f} : absent du manifeste. Relance optimize-images.ts --write, ou retire le fichier.`);
      continue;
    }

    const format = formatReel(abs);
    if (format !== 'webp') refus.push(`${f} : format réel « ${format} », attendu « webp » (lu dans les octets).`);

    const empreinte = sha256(readFileSync(abs));
    if (empreinte !== attendu.sha256) {
      refus.push(`${f} : sha256 ${empreinte.slice(0, 12)}… ≠ manifeste ${attendu.sha256.slice(0, 12)}…`);
      continue; // dimensions et poids ne veulent plus rien dire
    }

    const octets = statSync(abs).size;
    if (octets !== attendu.octets) refus.push(`${f} : ${octets} octets, manifeste ${attendu.octets}.`);

    const fam = familleDe(stem);
    if (!fam) {
      refus.push(`${f} : aucune famille déclarée. Ajoute son motif dans FAMILLES d'optimize-images.ts.`);
      continue;
    }
    const cible = largeurCible(fam);
    const { largeur } = dimensions(abs);
    if (largeur > cible) {
      refus.push(`${f} : ${largeur} px de large pour une cible de ${cible} px (famille « ${fam.nom} »).`);
    }
  }

  for (const [f] of parFichier) {
    if (!surDisque.includes(f)) refus.push(`${f} : au manifeste mais absent du dossier.`);
  }

  // (5) Une image citée par un descripteur mais absente n'échouerait aujourd'hui
  //     qu'à la composition, dans le conteneur.
  const references = stemsReferences();
  const stemsSurDisque = new Set(surDisque.map((f) => path.basename(f, path.extname(f))));
  for (const [stem, sources] of sortedBy([...references.entries()], ([s]) => s)) {
    if (!stemsSurDisque.has(stem)) {
      refus.push(`« ${stem} » référencé par ${[...new Set(sources)].join(', ')} mais absent de assets/.`);
    }
  }
  for (const stem of sortedBy([...stemsSurDisque], (s) => s)) {
    if (!references.has(stem)) avertissements.push(`« ${stem} » présent mais référencé par aucun descripteur.`);
  }

  const total = surDisque.reduce((s, f) => s + statSync(path.join(IMG_DIR, f)).size, 0);

  for (const a of avertissements) console.warn(`  ~ ${a}`);
  if (refus.length > 0) {
    throw new Error(
      `${refus.length} refus sur les photos de page :\n` + refus.map((r) => `  · ${r}`).join('\n'),
    );
  }
  console.log(
    `✓ ${surDisque.length} photos de page, ${(total / 1024 / 1024).toFixed(1)} Mo` +
      `${avertissements.length > 0 ? ` — ${avertissements.length} orpheline(s), voir ci-dessus` : ''}`,
  );
}

runAsCli(import.meta.url, main);
