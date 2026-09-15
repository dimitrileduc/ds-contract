/**
 * `optimize-images.ts` — la conversion des photos de page en WebP à leur taille
 * d'affichage. TinySpec `specs/tiny/images-optimisation.md`.
 *
 * ── Ce script est un OUTIL D'AUTEUR, pas un maillon du build ────────────────
 * Il n'est appelé par aucun `npm run build`, par aucune porte, par aucun eval.
 * On le lance à la main, une fois, et on committe ses octets. La raison est le
 * déterminisme : un encodeur d'image est reproductible à version et plateforme
 * fixées (mesuré : 130 fichiers convertis deux fois, sorties identiques à
 * l'octet), mais RIEN ne garantit qu'il le reste entre deux versions de
 * libwebp ou entre macOS et Linux. On ne cherche donc pas à l'épingler : on
 * rend sa reproductibilité INUTILE en figeant sa sortie dans git. Git est le
 * sceau ; l'outil est au même rang que Photoshop.
 *
 * C'est aussi pourquoi `check-images.ts` — qui, lui, vit dans une porte — ne
 * réencode jamais rien : il MESURE les octets committés. Un contrôle qui
 * mesure est déterministe par construction.
 *
 * ── Pourquoi WebP, et pourquoi ça ne gêne pas Odoo ─────────────────────────
 * Nos images sont servies par `/web/image/<id>-<checksum>/<nom>` : l'URL ne
 * porte AUCUNE dimension, donc Odoo rend les octets tels quels sans jamais
 * ouvrir l'image. Son moteur (`ImageProcess`, qui refuse le WebP en entrée) ne
 * se trouve jamais sur ce chemin. Et le jour où le client remplace une image
 * depuis l'éditeur, c'est SON fichier qui passe par la chaîne Odoo — le format
 * du nôtre n'y change rien.
 *
 * ── La largeur cible est le MAXIMUM sur les quatre paliers, pas le desktop ──
 * Il n'y a qu'une image pour tous les écrans (zéro `srcset` dans le module,
 * vérifié). Elle doit donc couvrir son cas le plus large, et ce cas n'est PAS
 * toujours le grand écran : la carte Réassurance mesure 284 px à 1728 (cinq
 * colonnes) mais 738 px à 834 (une carte par ligne). Dimensionner « au
 * desktop » étirerait l'image sur toutes les tablettes.
 *
 * Usage :
 *   npx tsx scripts/odoo/optimize-images.ts              # plan, n'écrit rien
 *   npx tsx scripts/odoo/optimize-images.ts --write      # applique
 *   npx tsx scripts/odoo/optimize-images.ts --only rea   # restreint
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { canonicalJson, repoPath, sha256, sortedBy } from './lib/canonical.js';
import { arg, runAsCli } from './lib/cli.js';

export const IMG_DIR = repoPath('integrations', 'odoo', 'authoring', 'assets');
export const MANIFEST = path.join(IMG_DIR, 'MANIFEST.json');

/** Qualité WebP. 82 : au-dessus du seuil où l'œil sépare encore du sans perte
 *  sur une photo, en dessous de la zone où le gain de poids s'effondre. */
const QUALITE = 82;

/** Densité appliquée aux petits emplacements (décision owner 2026-09-15).
 *  Sous ce seuil, garder la double densité coûte peu en octets et évite la
 *  SEULE régression visible possible de la passe : une vignette aujourd'hui
 *  très nette qui deviendrait douce sur un écran Retina. */
const SEUIL_PETIT_PX = 400;
const DENSITE_PETIT = 2;

/**
 * Les familles, écrites en clair — jamais déduites à l'exécution.
 *
 * Une règle devinée est une règle invisible : si le motif d'un fichier neuf ne
 * correspond à rien ici, le script REFUSE en le nommant plutôt que de lui
 * appliquer un défaut silencieux.
 *
 * `largeurCss` = largeur de rendu maximale sur les quatre paliers gouvernés
 * (390 / 834 / 1200 / 1728), relevée dans le CSS du module. La colonne de
 * contenu vaut 342 / 738 / 1088 / 1550 — aucune gouttière de page, la
 * gouttière vit dans chaque section (24 / 48 / 56 / 89).
 */
export interface Famille {
  readonly nom: string;
  readonly motif: RegExp;
  readonly largeurCss: number;
  readonly pourquoi: string;
}

export const FAMILLES: readonly Famille[] = [
  {
    nom: 'fond-hero',
    motif: /^hero_/,
    largeurCss: 1728,
    pourquoi: 'section pleine largeur, object-fit cover — components.pqr.css:3092',
  },
  {
    nom: 'fond-devis',
    motif: /^devis(_|$)/,
    largeurCss: 1728,
    pourquoi: 'section bord à bord, padding-inline 0 — components.pqr.css:830',
  },
  {
    nom: 'fond-sav',
    motif: /^sav_bg$/,
    largeurCss: 1550,
    pourquoi: 'calc(100% - 2×89) en wide — responsive/sav.pqr.css:139',
  },
  {
    nom: 'photo-sav',
    motif: /^sav_/,
    largeurCss: 738,
    pourquoi: 'colonne unique sous 992 : 834−96 — le max est en TABLETTE, pas en wide (563)',
  },
  {
    nom: 'carte-categorie',
    motif: /^cat_/,
    largeurCss: 818,
    pourquoi: '743 en wide (2 cartes, flex 1 1 0) × 1,1 du zoom au survol — responsive/carte-categorie.pqr.css:118',
  },
  {
    nom: 'carte-reassurance',
    motif: /^rea(\d|_)/,
    largeurCss: 738,
    pourquoi: 'une carte par ligne sous 992 : 834−96. Le max est en TABLETTE (284 en wide)',
  },
  {
    nom: 'tuile-realisation',
    motif: /^rlz/,
    largeurCss: 743,
    pourquoi: 'la GRANDE tuile (span 2×2) en wide. Couvre aussi la tuile normale (340×2 = 680)',
  },
  {
    nom: 'photo-equipe',
    motif: /^equipe(_|$)/,
    largeurCss: 284,
    pourquoi: 'grille 5 colonnes en wide : (1550−128)/5 — responsive/equipe.pqr.css:99. Repos et survol sont un fondu croisé, même boîte',
  },
  {
    nom: 'produit',
    motif: /^(produit|prod_)/,
    largeurCss: 230,
    pourquoi: 'carte à largeur FIXE 288 en wide, moins bordures et marges intérieures',
  },
];

/**
 * Fichiers à SUPPRIMER plutôt qu'à convertir, chacun avec sa raison mesurée.
 * Les supprimer est un geste séparé de la conversion : il se lit dans le diff.
 */
export const A_SUPPRIMER: ReadonlyArray<{ readonly stem: string; readonly pourquoi: string }> = [
  {
    stem: 'hero',
    pourquoi: "orphelin — aucun descripteur ne le référence ; seul usage restant : un exemple du README d'authoring",
  },
  {
    stem: 'hero_video',
    pourquoi: "orphelin — remplacé par hero_video_facade ; conservation déclarée par specs/tiny/hero-video-facade.md:41, sans usage",
  },
  {
    stem: 'coordonnees_plan',
    pourquoi: "mort — la part coordonnees-map porte un <iframe> Google Maps ; set_img ne pose un média que sur <video> ou <img>",
  },
  {
    stem: 'coordonnees_plan_v2',
    pourquoi: "mort — même cause. img_url() est pourtant évalué AVANT set_img : les octets étaient lus et publiés en ir.attachment",
  },
];

const EXT_IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const familleDe = (stem: string): Famille | null =>
  FAMILLES.find((f) => f.motif.test(stem)) ?? null;

/** Largeur cible finale : la largeur CSS, doublée sous le seuil « petit ». */
export const largeurCible = (f: Famille): number =>
  f.largeurCss <= SEUIL_PETIT_PX ? f.largeurCss * DENSITE_PETIT : f.largeurCss;

/** Le format RÉEL, lu dans les octets — jamais l'extension.
 *  Cinq fichiers `.png` du dossier contiennent du JPEG ; s'y fier ferait
 *  publier un mauvais type MIME, ce qu'ils font aujourd'hui. */
export function formatReel(abs: string): string {
  const t = readFileSync(abs).subarray(0, 16);
  if (t[0] === 0xff && t[1] === 0xd8 && t[2] === 0xff) return 'jpeg';
  if (t[0] === 0x89 && t.subarray(1, 4).toString('latin1') === 'PNG') return 'png';
  if (t.subarray(0, 4).toString('latin1') === 'RIFF' && t.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  if (t.subarray(0, 3).toString('latin1') === 'GIF') return 'gif';
  return 'inconnu';
}

export interface Dimensions {
  readonly largeur: number;
  readonly hauteur: number;
}

/** Dimensions par `ffprobe` — présent sur le poste, multi-plateforme, et le
 *  même outil que celui qui encode. */
export function dimensions(abs: string): Dimensions {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', abs],
    { encoding: 'utf8' },
  ).trim();
  const [w, h] = out.split('x').map((n) => Number.parseInt(n, 10));
  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    throw new Error(`dimensions illisibles pour ${path.basename(abs)} : « ${out} »`);
  }
  return { largeur: w, hauteur: h };
}

export const versionOutil = (bin: string, args: readonly string[], re: RegExp): string => {
  const out = execFileSync(bin, [...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return out.match(re)?.[1] ?? 'inconnue';
};

/**
 * Encode en WebP à la largeur voulue.
 *
 * `cwebp` fait le redimensionnement ET l'encodage, donc un seul outil sur le
 * chemin et un seul point de version à consigner. Trois choix explicites :
 *   · `-resize L 0` : la hauteur suit le rapport. On ne l'appelle QUE si
 *     l'image est plus large que la cible — `cwebp` agrandirait sinon, ce qui
 *     ajouterait du poids pour zéro pixel utile.
 *   · `-metadata icc` : on jette EXIF et XMP (poids mort, parfois du GPS) mais
 *     on GARDE le profil couleur. Quatre fichiers en portent un ; le jeter
 *     déplacerait leurs couleurs sans que rien ne le signale.
 *   · `-alpha_q 100` : la transparence reste sans perte. Un seul fichier du
 *     jeu s'en sert vraiment (sav_tech, 40,12 % de pixels non opaques) mais
 *     la règle ne doit pas dépendre de ce compte.
 */
export function encoder(src: string, dest: string, largeur: number, largeurSource: number): void {
  const redim = largeurSource > largeur ? ['-resize', String(largeur), '0'] : [];
  execFileSync(
    'cwebp',
    ['-quiet', '-q', String(QUALITE), '-m', '6', '-alpha_q', '100', '-metadata', 'icc', ...redim, src, '-o', dest],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

export interface Ligne {
  readonly stem: string;
  readonly fichierAvant: string;
  readonly fichierApres: string;
  readonly famille: string;
  readonly formatAvant: string;
  readonly formatApres: string;
  readonly largeurAvant: number;
  readonly hauteurAvant: number;
  readonly largeurApres: number;
  readonly hauteurApres: number;
  readonly octetsAvant: number;
  readonly octetsApres: number;
  readonly largeurCible: number;
  readonly sha256: string;
}

const ko = (n: number): string => `${(n / 1024).toFixed(0)} Ko`;

export function main(): void {
  const argv = process.argv.slice(2);
  const ecrire = argv.includes('--write');
  const seulement = arg(argv, '--only');

  // `--only` filtre ce que la boucle traite, donc `lignes` ne couvrirait qu'une
  // partie du dossier — et le manifeste écrit à la fin EFFACERAIT tout le
  // reste. La porte tomberait alors sur « absent du manifeste » pour cent
  // fichiers parfaitement sains. Mesuré en s'y faisant prendre le 2026-09-15.
  if (ecrire && seulement) {
    throw new Error(
      '`--only` et `--write` ensemble écriraient un manifeste partiel, qui condamnerait tous les autres fichiers.\n' +
        "  · pour essayer un motif : `--only <motif>` seul (n'écrit rien) ;\n" +
        '  · pour appliquer : `--write` seul, sur tout le dossier.',
    );
  }

  const fichiers = sortedBy(
    readdirSync(IMG_DIR).filter((f) => EXT_IMAGE.has(path.extname(f).toLowerCase())),
    (f) => f,
  );

  const aSupprimer = new Map(A_SUPPRIMER.map((s) => [s.stem, s.pourquoi]));

  // ── Pré-vol : tout refus tombe AVANT le premier octet écrit ───────────────
  // Une passe qui s'arrête au 40e fichier laisse le dossier à moitié converti,
  // et `IMG_EXTENSIONS` du composeur ferait alors gagner les originaux restants
  // en silence. On valide donc l'intégralité du jeu d'abord.
  const inconnus: string[] = [];
  for (const f of fichiers) {
    const stem = path.basename(f, path.extname(f));
    if (aSupprimer.has(stem)) continue;
    if (!familleDe(stem)) inconnus.push(f);
  }
  if (inconnus.length > 0) {
    throw new Error(
      `${inconnus.length} fichier(s) sans famille déclarée — ajoute son motif dans FAMILLES plutôt que de laisser un défaut décider :\n` +
        inconnus.map((f) => `  · ${f}`).join('\n'),
    );
  }

  const tmp = mkdtempSync(path.join(tmpdir(), 'pqr-webp-'));
  const lignes: Ligne[] = [];
  const supprimes: string[] = [];
  const ignores: string[] = [];
  const inchangees: string[] = [];

  try {
    for (const f of fichiers) {
      const ext = path.extname(f);
      const stem = path.basename(f, ext);
      const abs = path.join(IMG_DIR, f);

      const raison = aSupprimer.get(stem);
      if (raison) {
        supprimes.push(`${f} — ${raison}`);
        if (ecrire) unlinkSync(abs);
        continue;
      }
      if (seulement && !stem.includes(seulement)) continue;

      const fam = familleDe(stem);
      if (!fam) throw new Error(`famille absente pour ${f} (le pré-vol aurait dû l'attraper)`);

      const cible = largeurCible(fam);
      const avant = dimensions(abs);
      const octetsAvant = statSync(abs).size;
      const formatAvant = formatReel(abs);
      const largeurFinale = Math.min(cible, avant.largeur);

      // ── IDEMPOTENCE, et ce n'est pas du confort ────────────────────────────
      // Un WebP déjà à sa taille n'est PAS réencodé. Le relancer le ferait
      // passer une seconde fois par un encodeur avec perte : plus petit à
      // chaque tour, plus abîmé à chaque tour, et sans qu'aucun message ne le
      // dise. Une deuxième exécution doit être un non-événement.
      if (formatAvant === 'webp' && avant.largeur <= cible) {
        inchangees.push(`${f} — déjà WebP à ${avant.largeur} px pour une cible de ${cible}`);
        lignes.push({
          stem,
          fichierAvant: f,
          fichierApres: f,
          famille: fam.nom,
          formatAvant,
          formatApres: formatAvant,
          largeurAvant: avant.largeur,
          hauteurAvant: avant.hauteur,
          largeurApres: avant.largeur,
          hauteurApres: avant.hauteur,
          octetsAvant,
          octetsApres: octetsAvant,
          largeurCible: cible,
          sha256: sha256(readFileSync(abs)),
        });
        continue;
      }

      const sortie = path.join(tmp, `${stem}.webp`);
      encoder(abs, sortie, largeurFinale, avant.largeur);

      const octetsApres = statSync(sortie).size;
      // Un fichier qui GROSSIT est un refus, pas un compromis : on le nomme et
      // on garde l'original. Réencoder un PNG déjà optimisé peut coûter 15 %
      // de plus — mesuré sur sav_tech en PNG→PNG.
      if (octetsApres >= octetsAvant) {
        ignores.push(`${f} — la conversion le ferait passer de ${ko(octetsAvant)} à ${ko(octetsApres)}`);
        continue;
      }

      const apres = dimensions(sortie);
      lignes.push({
        stem,
        fichierAvant: f,
        fichierApres: `${stem}.webp`,
        famille: fam.nom,
        formatAvant,
        formatApres: 'webp',
        largeurAvant: avant.largeur,
        hauteurAvant: avant.hauteur,
        largeurApres: apres.largeur,
        hauteurApres: apres.hauteur,
        octetsAvant,
        octetsApres,
        largeurCible: cible,
        sha256: sha256(readFileSync(sortie)),
      });

      if (ecrire) {
        writeFileSync(path.join(IMG_DIR, `${stem}.webp`), readFileSync(sortie));
        // L'ORDRE compte : `IMG_EXTENSIONS` du composeur cherche .jpg, .jpeg,
        // .png puis .webp et prend LE PREMIER TROUVÉ. Laisser l'original à
        // côté du WebP le ferait gagner sans qu'aucun message ne le dise.
        if (ext.toLowerCase() !== '.webp') unlinkSync(abs);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // ── Le plan, lisible ─────────────────────────────────────────────────────
  const parFamille = new Map<string, { avant: number; apres: number; n: number }>();
  for (const l of lignes) {
    const e = parFamille.get(l.famille) ?? { avant: 0, apres: 0, n: 0 };
    parFamille.set(l.famille, { avant: e.avant + l.octetsAvant, apres: e.apres + l.octetsApres, n: e.n + 1 });
  }

  console.log(`\n${ecrire ? 'CONVERTI' : 'PLAN (rien écrit — --write pour appliquer)'}\n`);
  console.log('fichier                          famille             avant       apres     dims');
  for (const l of sortedBy(lignes, (l) => `${l.famille}/${String(1e9 - l.octetsAvant).padStart(10, '0')}`)) {
    console.log(
      `${l.fichierAvant.padEnd(32)} ${l.famille.padEnd(19)} ${ko(l.octetsAvant).padStart(9)} ${ko(l.octetsApres).padStart(9)}   ${l.largeurAvant}→${l.largeurApres}`,
    );
  }

  console.log('\nPar famille :');
  for (const [nom, e] of sortedBy([...parFamille.entries()], ([n]) => n)) {
    const pct = ((1 - e.apres / e.avant) * 100).toFixed(0);
    console.log(`  ${nom.padEnd(20)} ${String(e.n).padStart(3)} fichiers  ${ko(e.avant).padStart(10)} → ${ko(e.apres).padStart(9)}  (−${pct} %)`);
  }

  const avant = lignes.reduce((s, l) => s + l.octetsAvant, 0);
  const apres = lignes.reduce((s, l) => s + l.octetsApres, 0);
  const octetsSupprimes = supprimes.length;

  if (supprimes.length > 0) {
    console.log(`\nSupprimés (${octetsSupprimes}) :`);
    for (const s of supprimes) console.log(`  · ${s}`);
  }
  if (inchangees.length > 0) {
    console.log(`\nDéjà conformes, non réencodés (${inchangees.length}) :`);
    for (const s of inchangees) console.log(`  · ${s}`);
  }
  if (ignores.length > 0) {
    console.log(`\nLaissés tels quels (${ignores.length}) :`);
    for (const s of ignores) console.log(`  · ${s}`);
  }

  console.log(
    `\nTOTAL converti : ${(avant / 1024 / 1024).toFixed(1)} Mo → ${(apres / 1024 / 1024).toFixed(1)} Mo  (−${((1 - apres / avant) * 100).toFixed(0)} %, ${lignes.length} fichiers)\n`,
  );

  if (!ecrire) return;

  writeFileSync(
    MANIFEST,
    canonicalJson({
      _note:
        "Produit par `npx tsx scripts/odoo/optimize-images.ts --write`. Outil d'AUTEUR, hors build : les octets committés sont la référence, ce manifeste sert à `npm run odoo:images:check`, qui mesure sans jamais réencoder.",
      qualiteWebp: QUALITE,
      seuilPetitPx: SEUIL_PETIT_PX,
      densitePetit: DENSITE_PETIT,
      outils: {
        cwebp: versionOutil('cwebp', ['-version'], /^(\S+)/),
        ffprobe: versionOutil('ffprobe', ['-version'], /ffprobe version (\S+)/),
      },
      familles: FAMILLES.map((f) => ({
        nom: f.nom,
        motif: f.motif.source,
        largeurCss: f.largeurCss,
        largeurCible: largeurCible(f),
        pourquoi: f.pourquoi,
      })),
      // Le manifeste décrit l'ÉTAT COURANT, jamais un « avant ». Une deuxième
      // exécution lit des fichiers déjà convertis : un champ `octetsAvant` y
      // recopierait la taille d'APRÈS et mentirait sans rien signaler (constaté
      // le 2026-09-15). Le relevé avant/après est daté, il vit dans la tinyspec.
      images: lignes.map((l) => ({
        fichier: l.fichierApres,
        famille: l.famille,
        largeur: l.largeurApres,
        hauteur: l.hauteurApres,
        octets: l.octetsApres,
        largeurCible: l.largeurCible,
        sha256: l.sha256,
      })),
    }),
  );
  console.log(`Manifeste écrit : ${path.relative(process.cwd(), MANIFEST)}`);
}

runAsCli(import.meta.url, main);
